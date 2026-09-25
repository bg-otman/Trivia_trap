# إصلاح دورة التصويت وإظهار النتائج

## ملخص المشكل الأصلي

الدورة كانت كتبان واقفة فـ `VOTE` أو كتدوز لـ `REVEAL` بلا نتيجة. السبب ما كانش واحد:

- `calculate_results()` كانت كتتعامل مع قيمة من `dict[str, PlayerInfo]` بحال إلا كانت `dict` وكتطيح بـ `AttributeError`.
- `build_voting_choices()` كانت كتولد معرفات جديدة من `UUID`، ولكن اللائحة اللي تشافت فـ `PHASE_VOTING` ما كانتش كتتحفظ للحساب.
- آخر مصوّت كان كيستعمل نفس المسار المحمي ديال `NEXT_PHASE`، وبالتالي اللاعب العادي كان كياخذ `FORBIDDEN`.
- الاستثناء داخل `phase_timer()` كان يقدر يبقى غير فـ `stderr` على شكل `Task exception was never retrieved`، لذلك عميل بحال `Postman` ما كيشوف حتى `ERROR`.
- شرط الاكتمال كان كيعتمد على جميع عناصر `room.players` حتى إلا كان اللاعب منقطع.
- القيمة الافتراضية ديال `RoomPhase` كانت مشتركة بين الغرف.

## الأسباب الحقيقية والإصلاحات

### الحساب والنقط

`app/dataProcessing/ingestion.py`:

- `calculate_results(votes, choices, players)` دابا كتستعمل غير مفاتيح `players`، وما كتقرا حتى خاصية من `PlayerInfo` وما كتبدلش `score`.
- كتفرض جواب صحيح واحد بالضبط، وكتتحقق من المصوت، الاختيار، المؤلفين، وأن معرفات الاختيارات من نوع `str` وفريدة.
- `validate_vote()` ولات كترفض النوع غير النصي بـ `INVALID_PAYLOAD`.
- النقط ولات: `2 * correct_votes + bluff_votes_received`.

### نفس الاختيارات من العرض حتى الحساب

`app/engine/room_models.py` و`app/engine/events.py`:

- تزاد `RoomMetaData.voting_choices` باستعمال `Field(default_factory=list)`.
- `get_vote_choices()` كيبني الاختيارات مرة وحدة، كيحفظ النسخة الكاملة، وكيبعت للعميل غير `id` و`text`.
- `reveal_results()` كيستعمل نفس اللائحة ونفس معرفات `UUID`، ومن بعد كيبيّن `author_ids` و`is_correct` و`voters`.

### الانتقالات والمؤقتات

`app/engine/events.py`:

- `to_next_phase()` بقى هو المسار الخارجي ديال `NEXT_PHASE` ومسموح غير للمضيف.
- `advance_phase()` و`advance_phase_locked()` هما المسار الداخلي ديال اكتمال الأجوبة، اكتمال الأصوات، والمؤقت؛ ما كيعتمدوش على هوية آخر لاعب.
- `state_lock` كيسلسل التغييرات داخل الغرفة، وكيمنع صوتين متزامنين من نفس اللاعب، انتقالين، أو حسابين فمرة وحدة.
- كل مؤقت مربوط بـ `room_id` والمرحلة المنتظرة ونفس كائن المهمة. مؤقت قديم ما يقدرش يحرك مرحلة جديدة.
- الاستثناء غير المتوقع كيتسجل مع الغرفة والمرحلة، كيرجع المرحلة السابقة، وكيبعت `ERROR` بكود `SERVER_ERROR` إذا كان البث ما زال ممكن.
- ملي آخر صوت يسبق المؤقت، المؤقت كيتلغى. وملي المؤقت يسبق الصوت، `state_lock` كيضمن نتيجة وحدة فقط.

### الغرف واللاعبون

`app/engine/room_models.py` و`app/engine/room_manager.py`:

- `phase` و`state_lock` عند كل غرفة مستقلين باستعمال `default_factory`.
- اللاعب المؤهل للاكتمال هو اللي عندو `is_present=True`، ماشي `len(room.players)`.
- الانقطاع العادي كيخلي اللاعب داخل الغرفة بـ `is_present=False`. إذا كان صوّت، الصوت ديالو كيبقى محسوب؛ وإذا ما صوّتش، ما كيبقاش حاجز الانتقال.
- رجوع نفس `user_id` كيبدل الاتصال القديم، وإغلاق الاتصال القديم ما يقدرش يعلّم الاتصال الجديد كمنقطع.
- انقطاع المضيف كينقل `host_id` للاعب حاضر.
- `LEAVE_ROOM` و`KICK_PLAYER` كيحيدو صوت اللاعب، الخدعة ديالو، واسمو من `author_ids`. الاختيار كيبقى بنفس `id` ولكن بلا نقطة للاعب اللي خرج نهائياً.
- فشل الإرسال لاتصال ميت ما كيوقفش الإرسال للاتصالات الأخرى.

### الأنواع وتنظيف الجولة

`app/engine/events.py` و`app/engine/utils.py`:

- `category.id` خاصو يكون `int` حقيقي؛ القيم `"1"` و`"01"` و`bool` كتترفض قبل استعلام قاعدة البيانات.
- `choice_id` خاصو يكون `str`. ما كاين حتى تحويل صامت من `int`.
- `user_id` جاي من `WebSocket query parameter` وكيبقى `str` داخل الغرفة، داخل مفاتيح `votes`، وداخل `author_ids`.
- معرف `UUID` ديال الاختيار كيتولد بـ `uuid4().hex` وكيبقى `str` قابل للتحويل لـ `JSON`.
- عند دخول `CATEGORY` ديال جولة جديدة كيتنظفو `active_question` و`bluffs` و`votes` و`voting_choices` وبيانات السؤال، بينما مجموع `PlayerInfo.score` كيبقى.
- ما تبدل حتى `database model` ولا ملف `Alembic`.

## العقد النهائي ديال `choices`

النسخة الداخلية المخزنة فـ `RoomMetaData.voting_choices`:

```json
{
  "id": "uuid-hex-string",
  "text": "answer text",
  "author_ids": ["player-id"],
  "is_correct": false
}
```

داخل `PHASE_VOTING` كيتبعت غير:

```json
{
  "id": "uuid-hex-string",
  "text": "answer text"
}
```

داخل `RESULTS_REVEALED` كيتزاد الكشف ديال `author_ids` و`is_correct` و`voters`.

## العقد النهائي ديال `votes`

`RoomMetaData.voting_results` هو:

```python
dict[str, str]
```

المفتاح هو `user_id` النصي، والقيمة هي `choice_id` النصي من نفس لائحة الجولة. الصوت ما كيتخزنش حتى تنجح `validate_vote()` ضد `NOT_IN_ROOM` و`ALREADY_VOTED` و`INVALID_CHOICE` و`SELF_VOTE` و`INVALID_PAYLOAD`.

## عقد نتيجة `calculate_results()`

```json
{
  "correct_choice_id": "choice-id",
  "choices": [
    {
      "id": "choice-id",
      "text": "answer",
      "author_ids": ["p1"],
      "voters": ["p2"],
      "is_correct": false
    }
  ],
  "player_stats": {
    "p1": {
      "correct_votes": 0,
      "bluff_votes_received": 1,
      "round_points": 1
    }
  }
}
```

`reveal_results()` كتزيد `leaderboard` و`round` و`total_rounds`، وكتطبق `round_points` على المجموع مرة وحدة.

## الدورة من `PHASE_VOTING` حتى `RESULTS_REVEALED`

1. `get_vote_choices()` كيبني ويخزن الاختيارات وكيبث `PHASE_VOTING` بلا معلومات سرية.
2. `submit_vote()` كيتأكد من المرحلة والنوع وكيشغل `validate_vote()` تحت `state_lock`.
3. إذا باقي لاعب حاضر ما صوتش، المصوت كيتوصل بـ `VOTE_SUBMITTED`.
4. إذا كملو الحاضرين، الانتقال الداخلي كيلغي المؤقت ويدخل `REVEAL`.
5. إذا ما كملوش، `phase_timer()` كيدخل `REVEAL` عند نهاية `vote_time` حتى مع `votes={}`.
6. `calculate_results()` كتحسب الجولة، و`reveal_results()` كتطبق النقط وكتبث `RESULTS_REVEALED`.

## عدم التصويت والانقطاع

- عدم التصويت مسموح، وكيعطي `0` نقطة.
- اللاعب المتصل اللي ما صوّتش كيتسنى حتى المؤقت.
- اللاعب المنقطع اللي ما صوّتش ما كيتحسبش فشرط الاكتمال.
- اللاعب اللي انقطع من بعد التصويت كيبقى صوته محسوب حيث ما زال مشاركاً فالجولة.
- اللاعب اللي خرج نهائياً أو تطرد كيتنظف أثره من بيانات الجولة.

## قواعد النقط

- صوت صحيح: `2` نقط للمصوت.
- كل صوت منجذب لخدعة: `1` نقطة لكل مؤلف ديالها.
- جواب خاطئ من قاعدة البيانات: `0`.
- بلا صوت: `0`.

مثال: `p2` صوّت للصحيح وشي لاعب صوّت لخدعة `p2`، إذن `p2` عندو `2 + 1 = 3` نقط فالجولة.

## الملفات اللي تبدلو

- `backend/app/dataProcessing/ingestion.py`
- `backend/app/engine/events.py`
- `backend/app/engine/room_manager.py`
- `backend/app/engine/room_models.py`
- `backend/app/engine/utils.py`
- `backend/pyproject.toml`
- `backend/uv.lock`
- `backend/tests/conftest.py`
- `backend/tests/test_ingestion.py`
- `backend/tests/test_events.py`
- `backend/tests/test_room_manager.py`
- `docs/websocket/VOTING_RESULTS_FIXES.md`

`backend/app/dataProcessing/services.py` كان متبدل قبل هاد الخدمة؛ التغيير الموجود فيه تحافظ عليه وما تزاد فيه حتى تعديل من هاد الإصلاح.

## الاختبارات والنتائج

الاختبارات الآلية: `45 passed`, `0 failed`.

- `tests/test_ingestion.py`: `20 passed`. فيها صفر أصوات، الصحيح، الخدعة، جواب قاعدة البيانات، لاعب بلا صوت، مؤلفان، صوتان على خدعة، مصوت أو مؤلف خارج الغرفة، اختيار مجهول، صفر أو جوج أجوبة صحيحة، ثبات معرفات `UUID`، وجميع حالات `validate_vote()`.
- `tests/test_events.py`: `21 passed`. فيها المضيف أو اللاعب العادي كآخر مصوت، التتابع والتزامن، الصوت المكرر المتزامن، صفر وبعض الأصوات مع المؤقت، لاعب منقطع، سباق آخر صوت مع المؤقت، منع الحساب والنقط المكررة، مؤقت قديم، استثناء المؤقت والرجوع للمرحلة السابقة، إخفاء المعلومات السرية، تنظيف الجولة، استقلال الغرف، ورفض `category_id` النصي قبل قاعدة البيانات.
- `tests/test_room_manager.py`: `4 passed`. فيها استبدال اتصال بنفس `user_id`، نقل المضيف، فشل اتصال واحد أثناء البث، وتنظيف مراجع اللاعب اللي خرج نهائياً.

الاختبارات الحية عبر `WebSocket`: جوج دورات ناجحين بـ `3` لاعبين:

- دورة كاملة من `LOBBY` حتى `RESULTS_REVEALED`، وكان `p3` اللاعب العادي هو آخر مصوت. نفس معرفات الاختيارات وصلت فالنتيجة وما وصل حتى `ERROR`.
- دورة بلا حتى صوت؛ `RESULTS_REVEALED` وصل للثلاثة بعد `10.00` ثواني، النقط كلها `0`، والاتصالات بقاو مفتوحين حتى تسدو طوعياً.

خرج الخادم فالجوج ما كان فيه لا `traceback` لا `Task exception was never retrieved`.

فحوصات البيئة:

- `python -m compileall`: ناجح.
- `alembic current`: القاعدة فـ `7ae6b30e388a (head)`.
- `alembic check`: `No new upgrade operations detected`.
- `seed_database.py`: لقى `200` سؤال موجودين، `0` إضافات.
- `git diff --check`: ناجح.

## المشاكل المتبقية والمخاطر

- مكتبة `python-statemachine` كتخرج تحذير أن `current_state` قديم لصالح `configuration`. السلوك ناجح دابا، ولكن خاص migration لهاد الواجهة قبل ترقية كبيرة للمكتبة.
- اللاعب المنقطع كيبقى فالذاكرة عمداً باش يقدر يرجع بنفس `user_id`. ما كايناش دابا سياسة مهلة وتنظيف تلقائي للغرف المهجورة جزئياً.
- إذا وقع خطأ غير متوقع داخل انتقال المؤقت، المرحلة كترجع للحالة السابقة وكيخرج `ERROR`، ولكن ما كاينش retry أوتوماتيكي لنفس المؤقت؛ هاد القرار كيمنع loop ديال الأخطاء وكيحتاج تدخل العميل أو إصلاح سبب الخادم.
- حفظ النتيجة الدائمة عبر `save_game_results()` ماشي مربوط حالياً بدورة الأحداث، وما تبدلش فهاد الإصلاح.

## شنو خاص نشرح لزميلي المسؤول على الأحداث

1. `NEXT_PHASE` للمضيف فقط، ولكن الانتقالات الداخلية خاصها تبقى عبر `advance_phase()` وما تستعملش هوية آخر لاعب.
2. ممنوع إعادة بناء `choices` من بعد `PHASE_VOTING`؛ المصدر الوحيد هو `RoomMetaData.voting_choices`.
3. أي تعديل فـ `votes` أو المرحلة خاصو يدوز تحت `state_lock`.
4. `author_ids` و`is_correct` ما يخرجوش قبل `RESULTS_REVEALED`.
5. شرط الاكتمال كيعتمد على `is_present=True`، والانقطاع مختلف عن الخروج النهائي.
6. المؤقت الجديد خاصو دائماً يلغي القديم ويتحقق من الغرفة والمرحلة وكائن المهمة.

## أوامر إعادة الاختبار

من `backend`:

```bash
docker ps -a --filter name=trivia_postgres
uv run alembic upgrade head
uv run python -m app.dataProcessing.seed_database
uv run python -m compileall -q app
uv run pytest -q
uv run alembic current
uv run alembic check
git diff --check
git status --short
```

للتجربة الحية شغّل الخادم فطرفية:

```bash
make run
```

ومن عميل `WebSocket` استعمل:

```text
ws://127.0.0.1:8000/room/{room_id}?user_id={user_id}&user_name={user_name}
```

ثم مرر `UPDATE_SETTINGS` و`NEXT_PHASE` و`GET_QUESTION` و`SUBMIT_BLUFF` و`SUBMIT_VOTE`، وانتظر `RESULTS_REVEALED`. حالة صفر أصوات خاصها تنتظر `vote_time` زائد مهلة صغيرة فالعميل.
