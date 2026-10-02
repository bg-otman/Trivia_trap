"""Manage only a labelled local test container and its loopback ASGI process."""
import argparse
import hashlib
import json
import os
from pathlib import Path
import signal
import socket
import subprocess
import sys
import time
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
STATE_DIR = ROOT / ".achievement-lab"
STATE_FILE = STATE_DIR / "state.json"
LABEL = "trivia.achievement-lab"
OWNER = hashlib.sha256(str(ROOT).encode()).hexdigest()[:12]
CONTAINER = f"trivia-achievement-lab-{OWNER}"


def run(*args, **kwargs):
    return subprocess.run(args, check=True, text=True, **kwargs)


def inspect():
    result = subprocess.run(["docker", "inspect", CONTAINER], capture_output=True, text=True)
    if result.returncode:
        return None
    info = json.loads(result.stdout)[0]
    if info["Config"].get("Labels", {}).get(LABEL) != OWNER:
        raise RuntimeError("Refusing container not owned by this test environment")
    return info


def save(state):
    STATE_DIR.mkdir(exist_ok=True)
    STATE_FILE.write_text(json.dumps(state, indent=2) + "\n")


def environment(state):
    return {**os.environ, "DATABASE_URL": state["database_url"], "ACHIEVEMENT_LAB": "1",
            "PYTHONPATH": str(ROOT / "app") + os.pathsep + str(ROOT), "PYTHONDONTWRITEBYTECODE": "1"}


def server_alive(state):
    pid = state.get("pid")
    try:
        cmd = Path(f"/proc/{pid}/cmdline").read_bytes()
        return b"achievement_lab.app:local_app" in cmd and b"uvicorn" in cmd
    except FileNotFoundError:
        return False


def stop_server(state):
    if server_alive(state):
        os.kill(state["pid"], signal.SIGTERM)
        for _ in range(100):
            if not server_alive(state):
                break
            time.sleep(.1)
        if server_alive(state):
            raise RuntimeError("Test server did not stop; inspect server.log")
    state.pop("pid", None)
    save(state)


def start_server(state):
    if server_alive(state):
        return
    with socket.socket() as listener:
        listener.bind(("127.0.0.1", 0))
        port = listener.getsockname()[1]
    with (STATE_DIR / "server.log").open("a") as log:
        process = subprocess.Popen([sys.executable, "-m", "uvicorn", "achievement_lab.app:local_app",
            "--factory", "--host", "127.0.0.1", "--port", str(port)], cwd=ROOT, env=environment(state),
            stdout=log, stderr=log, stdin=subprocess.DEVNULL, start_new_session=True)
    state.update(pid=process.pid, http_url=f"http://127.0.0.1:{port}", ws_url=f"ws://127.0.0.1:{port}")
    save(state)
    for _ in range(100):
        try:
            with urlopen(Request(state["http_url"] + "/test/profile", headers={
                    "Authorization": "Bearer lab-player-101"}), timeout=1) as response:
                if response.status == 200:
                    return
        except OSError:
            pass
        if process.poll() is not None:
            break
        time.sleep(.1)
    raise RuntimeError("Test server did not start; inspect .achievement-lab/server.log")


def start(state):
    info = inspect()
    if info is None:
        run("docker", "run", "-d", "--name", CONTAINER, "--label", f"{LABEL}={OWNER}",
            "-e", "POSTGRES_USER=achievement_test", "-e", "POSTGRES_PASSWORD=achievement_test",
            "-e", "POSTGRES_DB=achievement_test_lab", "-p", "127.0.0.1::5432", "postgres:16-alpine",
            stdout=subprocess.DEVNULL)
    elif not info["State"]["Running"]:
        run("docker", "start", CONTAINER, stdout=subprocess.DEVNULL)
    for _ in range(60):
        ready = subprocess.run(["docker", "exec", CONTAINER, "pg_isready", "-h", "127.0.0.1",
                                "-U", "achievement_test", "-d", "achievement_test_lab"], capture_output=True)
        if ready.returncode == 0:
            break
        time.sleep(.5)
    else:
        raise RuntimeError("Test PostgreSQL did not start")
    port = run("docker", "port", CONTAINER, "5432", capture_output=True).stdout.strip().rsplit(":", 1)[1]
    state["database_url"] = f"postgresql+asyncpg://achievement_test:achievement_test@127.0.0.1:{port}/achievement_test_lab"
    save(state)
    run(sys.executable, "-m", "alembic", "upgrade", "head", cwd=ROOT, env=environment(state))
    run(sys.executable, "-m", "achievement_lab.seed", cwd=ROOT, env=environment(state))
    start_server(state)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("action", choices=["start", "status", "stop", "clean", "restart-server", "verify-restart", "test", "client", "profile", "demo"])
    parser.add_argument("extra", nargs=argparse.REMAINDER)
    args = parser.parse_args()
    state = json.loads(STATE_FILE.read_text()) if STATE_FILE.exists() else {}
    if args.action == "start":
        start(state)
    elif args.action in {"stop", "clean"}:
        stop_server(state)
        if inspect() is not None:
            run("docker", "stop" if args.action == "stop" else "rm", *( [] if args.action == "stop" else ["-f", "-v"]), CONTAINER)
        if args.action == "clean":
            STATE_FILE.unlink(missing_ok=True)
        return
    elif args.action == "restart-server":
        stop_server(state)
        start_server(state)
    elif args.action == "verify-restart":
        def profiles():
            values = {}
            for uid in range(101, 106):
                with urlopen(Request(state["http_url"] + "/test/profile", headers={
                        "Authorization": f"Bearer lab-player-{uid}"})) as response:
                    values[uid] = json.load(response)
            return values
        before = profiles()
        if not before[101]["history"]["completed_games"]:
            raise RuntimeError("Run demo first so there is saved history to verify")
        previous_pid = state["pid"]
        stop_server(state)
        start_server(state)
        after = profiles()
        assert state["pid"] != previous_pid and before == after, "Persisted profile changed after restart"
        evidence = {"old_pid": previous_pid, "new_pid": state["pid"], "profiles_equal": True, "profiles": after}
        (STATE_DIR / "restart-evidence.json").write_text(json.dumps(evidence, indent=2) + "\n")
        print(json.dumps(evidence, indent=2))
        return
    elif args.action == "test":
        if not state.get("database_url") or inspect() is None:
            raise RuntimeError("Run start first")
        paths = args.extra or ["tests/test_achievement_journey.py", "tests/test_persistence.py", "tests/test_events.py",
                              "tests/test_ingestion.py", "app/dataProcessing/test.py"]
        env = {**environment(state), "ACHIEVEMENT_TEST_DATABASE_URL": state["database_url"]}
        result = subprocess.run([sys.executable, "-m", "pytest", "-q", "-p", "no:cacheprovider", *paths,
                                "--disable-warnings", "--tb=short"], cwd=ROOT, env=env)
        raise SystemExit(result.returncode)
    elif args.action in {"client", "demo"}:
        module = "achievement_lab.client" if args.action == "client" else "achievement_lab.journey"
        run(sys.executable, "-m", module, "--url", state["ws_url"], *args.extra, cwd=ROOT, env=environment(state))
        return
    elif args.action == "profile":
        uid = int(args.extra[0]) if args.extra else 101
        with urlopen(Request(state["http_url"] + "/test/profile", headers={"Authorization": f"Bearer lab-player-{uid}"})) as response:
            print(json.dumps(json.load(response), indent=2))
        return
    print(json.dumps({"running": server_alive(state), "websocket": state.get("ws_url"),
                      "http": state.get("http_url"), "accounts": {uid: f"lab-player-{uid}" for uid in range(101, 106)},
                      "state": str(STATE_FILE)}, indent=2))


if __name__ == "__main__":
    main()
