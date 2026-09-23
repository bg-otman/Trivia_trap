# Category Models

قسمت الـCategory لجوج Tables:

- **categories:** فيها المعلومات المشتركة اللي ما كتبدلش حسب اللغة، وهي الـID والصورة.
- **category_translations:** فيها الاسم ديال Category حسب كل لغة.

العلاقة بيناتهم هي **One-to-Many**: Category وحدة تقدر يكون عندها عدة Translations، ولكن كل Translation تابعة لـCategory وحدة.

مثال:

| category_id | language_code | name |
|---:|---|---|
| 1 | en | Science |
| 1 | ar | العلوم |

داخل **Category**، استعملت:

- **id:** Primary Key كيزيد تلقائياً.
- **image_url:** رابط اختياري لصورة Category.
- **translations:** ORM relationship كتخليني نوصل لجميع الترجمات باستعمال **category.translations**.

داخل **CategoryTranslation**، استعملت:

- **category_id:** Foreign Key كتشير لـ**categories.id**.
- **language_code:** Code ديال اللغة، بحال **en** أو**ar**.
- **name:** الاسم المترجم ديال Category.

درت **Composite Primary Key** من **(category_id, language_code)** باش كل Category يكون عندها غير Translation وحدة لكل لغة.

درت **Unique Constraint** على **(language_code, name)** باش ما يتكررش نفس اسم Category فنفس اللغة.

استعملت **back_populates** باش العلاقة تخدم من الجهتين:

- **category.translations**
- **translation.category**

استعملت **ondelete=CASCADE** باش حذف Category يحذف ترجماتها من PostgreSQL، و**cascade=all, delete-orphan** باش SQLAlchemy يدير نفس إدارة العلاقة داخل الـORM.
