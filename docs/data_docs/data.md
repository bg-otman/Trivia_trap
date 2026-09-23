# Database Notes

هاد الملف كيجمع القرارات الأساسية اللي خديت فتصميم الـDatabase وربطها مع منطق اللعبة.

## 1. General Decisions

- ضفت العمود **image_url** للأسئلة، لأن بعض الأسئلة ممكن تحتاج صورة.
- ضفت **Indexes** باش نمنع التكرار ونسرع البحث حسب الـCategory واللغة.
- كل سؤال خاصو يتوفر على أربعة **Decoys** مختلفين على الأقل.
- منطق اختيار السؤال والـDecoys خاصو يرتبط بالـRoom من خلال **Service** أو**Repository**.
- معلومات الـRounds والـVotes مؤقتة، لذلك ما غاديش نخزنها فـPostgreSQL.

## 2. Data Storage

قسمت المعلومات حسب المدة اللي خاصها تبقى فيها:

| نوع المعلومة | مكان التخزين |
|---|---|
| معلومة مطلوبة غير أثناء اللعب | **RAM** أو**Redis** |
| معلومة خاصها تبقى من بعد نهاية اللعبة | **PostgreSQL** |
| معلومة مطلوبة فالـMatch History أوStatistics | **PostgreSQL** |

### RAM أوRedis

كنخزن فيهم المعلومات المؤقتة ديال اللعبة:

- **Room phase**
- **Timer**
- **Current round**
- **Current question**
- **Submitted bluffs**
- **Votes**
- **Temporary scores**
- **Random option order**

### PostgreSQL

كنخزن فيها المعلومات الدائمة:

- **Users**
- **Friendships**
- **Categories**
- **Category translations**
- **Questions**
- **Question decoys**
- **Games**
- **Final player results**

## 3. Database Concepts

### Primary Key

الـPrimary Key هو العمود أو مجموعة الأعمدة اللي كتميز كل Record داخل Table.

مثال:

~~~text
users.id
categories.id
games.id
~~~

### Foreign Key

الـForeign Key هو عمود كيربط Table بـTable أخرى.

مثال:

~~~text
questions.category_id
        ↓
categories.id
~~~

هاد العلاقة كتمنع إضافة سؤال بـ**category_id** ما كايناش.

### UUID

الـUUID هو معرف فريد كنستعملو فـ**games.id**.

مثال:

~~~text
123e4567-e89b-12d3-a456-426614174000
~~~

استعملتو فالألعاب لأن الـGame ممكن تتنشأ فـعدة أماكن، والـUUID كيقلل احتمال تكرار نفس المعرف.

### ON DELETE CASCADE

القاعدة **ON DELETE CASCADE** كتحذف Records التابعة تلقائياً ملي كيتحذف الـParent.

مثال:

~~~text
Category deleted
        ↓
Category translations deleted
~~~

خاص نستعملها غير ملي الـChild ما عندها حتى معنى بلا الـParent.

### Index

الـIndex كيسرع البحث، ويقدر كذلك يمنع التكرار إلا كان **Unique**.

مثال:

~~~text
(category_id, language_code)
~~~

هاد الـIndex كيسرع البحث على Category حسب اللغة، وإذا كان **Primary Key** كيمنع تكرار نفس اللغة لنفس Category.

## 4. Category Design

قسمت الـCategory لجوج Tables:

- **categories:** فيها المعلومات المشتركة اللي ما كتبدلش حسب اللغة.
- **category_translations:** فيها الاسم ديال Category حسب كل لغة.

العلاقة بيناتهم هي **One-to-Many**: Category وحدة تقدر يكون عندها عدة Translations، ولكن كل Translation تابعة لـCategory وحدة.

مثال:

| **category_id** | **language_code** | **name** |
|---:|---|---|
| 1 | en | Science |
| 1 | ar | العلوم |

### Category Model

داخل **Category** استعملت:

| العنصر | الدور |
|---|---|
| **id** | Primary Key كيزيد تلقائياً. |
| **image_url** | رابط اختياري لصورة Category. |
| **translations** | ORM relationship للوصول لجميع الترجمات. |

نقدر نوصل للترجمات باستعمال:

~~~python
category.translations
~~~

### CategoryTranslation Model

داخل **CategoryTranslation** استعملت:

| العنصر | الدور |
|---|---|
| **category_id** | Foreign Key كتشير إلى **categories.id**. |
| **language_code** | Code ديال اللغة، بحال **en** أو**ar**. |
| **name** | الاسم المترجم ديال Category. |
| **category** | ORM relationship للوصول للـCategory الأصلية. |

نقدر نوصل للـCategory باستعمال:

~~~python
translation.category
~~~

### Composite Primary Key

درت **Composite Primary Key** من:

~~~text
(category_id, language_code)
~~~

الهدف هو أن كل Category يكون عندها غير Translation وحدة لكل لغة.

مسموح:

~~~text
1 + en → Science
1 + ar → العلوم
~~~

ممنوع:

~~~text
1 + en → Science
1 + en → Sciences
~~~

### Unique Constraint

درت **Unique Constraint** على:

~~~text
(language_code, name)
~~~

هاد القاعدة كتمنع تكرار نفس اسم Category فنفس اللغة.

### ORM Relationship

استعملت **back_populates** باش العلاقة تخدم من الجهتين:

~~~python
category.translations
translation.category
~~~

استعملت جوج أنواع ديال الحذف:

- **ondelete="CASCADE":** PostgreSQL كتحذف الترجمات ملي كتتحذف Category.
- **cascade="all, delete-orphan":** SQLAlchemy كتدير نفس إدارة العلاقة داخل الـORM.

## 5. Category Event Flow

الـHost كيختار لغة واحدة للـRoom كاملة. جميع اللاعبين كيلعبو بنفس اللغة ونفس الأسئلة.

### PHASE_CATEGORY

الـBackend كيجيب Categories حسب لغة الـRoom، ويرجع **id** و**name** و**image_url**:

~~~json
{
  "event": "PHASE_CATEGORY",
  "data": {
    "categories": [
      {
        "id": 1,
        "name": "العلوم",
        "image_url": "/images/science.png"
      }
    ]
  }
}
~~~

الـFrontend كيعرض الاسم والصورة، وكيحتافظ بالـID.

### GET_QUESTION

ملي اللاعب يختار Category، الـFrontend كيصيفط غير **category_id**:

~~~json
{
  "event": "GET_QUESTION",
  "data": {
    "category_id": 1
  }
}
~~~

ما كنستعملش اسم Category كـIdentifier، لأن الاسم كيتبدل حسب اللغة. كنستعمل دائماً **category_id**.

الـBackend كيختار سؤال عندو:

~~~text
category_id = selected category
language_code = room language
~~~

## 6. Required Validations

قبل إرجاع Categories أو اختيار سؤال، خاص الـBackend يتأكد من:

- **language_code** مدعومة، مثلاً **ar** أو**en**.
- **category_id** موجودة.
- Category عندها Translation بلغة الـRoom.
- Category فيها أسئلة بنفس لغة الـRoom.
- السؤال عندو أربعة **Decoys** مختلفين على الأقل.
- الـDecoys مختلفين على الجواب الصحيح.
