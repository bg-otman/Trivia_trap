question data must have a image column
indexes for can't do the same catigories and question and for make tne searsh easy
add the QC in the room code 


| نوع المعلومة                             | فين نخزنوها؟ |
| ---------------------------------------- | ------------ |
| خاصها غير أثناء اللعب                    | `Redis`      |
| خاصها تبقى من بعد ما تسالي اللعبة        | `PostgreSQL` |
| خاصها تظهر فـMatch History أو Statistics | `PostgreSQL` |


A foreign key is a column or group of columns in one table that links to the primary key in another table to create a relationship between them. 
What a Foreign Key DoesConnects Tables: It matches data from a child table to a parent table.Enforces Data Integrity
It stops you from adding invalid data, such as an order for a customer ID that does not exist.Protects Relationships
It prevents you from deleting a parent record (like a customer) if child records (like orders) still depend on it.

A UUID (Universally Unique Identifier) is a 128-bit number used to uniquely identify information, objects, or records in computer systems.
It is usually written as a 36-character string with groups of letters and numbers split by hyphens, like "123e4567-e89b-12d3-a456-426614174000". 
You can learn more about its formal structure in the MDN UUID Glossary. 


DELETE CASCADE (often written as ON DELETE CASCADE) is a database rule that automatically deletes dependent child rows when their parent row is deleted. 
How It WorksParent Table: The main table with the primary record (for example, a Customers table).Child Table
The related table that points to the parent using a foreign key (for example, an Orders table).The Action
If you delete a customer from the Parent table, the database automatically deletes all orders tied to that customer in the Child table

| Table                  | شنو كتخزن؟                    |
| ---------------------- | ----------------------------- |
| `round_options`        | الاختيارات اللي بانو فالجولة. |
| `round_option_authors` | شكون كتب كل اختيار.           |
| `round_votes`          | شكون صوت على كل اختيار.       |


بالنسبة للـCategories:

* الـHost كيختار لغة الـRoom كاملة.
* `PHASE_CATEGORY` كترجع `id`, `name` و`image_url` حسب لغة الـRoom.
* الـFrontend كيعرض الاسم والصورة.
* ملي اللاعب يختار Category، `GET_QUESTION` كيصيفط غير `category_id`.
* الـBackend كيجيب سؤال عندو نفس `category_id` ونفس `language_code` ديال الـRoom.

مثال:

```json
{
  "event": "GET_QUESTION",
  "data": {
    "category_id": 1
  }
}
```

يعني ما نستعملوش اسم Category كـIdentifier لأنه كيتبدل حسب اللغة؛ نستعملو دائماً `category_id`.
