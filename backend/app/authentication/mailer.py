import logging
import os
import smtplib
import ssl
from email.message import EmailMessage
from pathlib import Path

logger = logging.getLogger(__name__)


def smtp_password() -> str | None:
    secret_file = os.environ.get("SMTP_PASSWORD_FILE")
    if secret_file:
        try:
            return Path(secret_file).read_text(encoding="utf-8").strip()
        except OSError:
            logger.error("Email not sent: cannot read SMTP_PASSWORD_FILE")
            return None
    return os.environ.get("SMTP_PASSWORD")


def send_email(to: str, subject: str, body: str) -> None:
    sender = os.environ.get("SMTP_EMAIL")
    password = smtp_password()
    if not sender or not password:
        logger.error("Email not sent: configure SMTP_EMAIL and SMTP_PASSWORD_FILE or SMTP_PASSWORD")
        return
    message = EmailMessage()
    message["From"] = f"Trivia Trap <{sender}>"
    message["To"] = to
    message["Subject"] = subject
    message.set_content(body)
    try:
        with smtplib.SMTP_SSL(
            "smtp.gmail.com", 465, context=ssl.create_default_context(), timeout=10,
        ) as server:
            server.login(sender, password)
            server.send_message(message)
    except (smtplib.SMTPException, OSError) as error:
        logger.error("Email not sent (%s)", type(error).__name__)
