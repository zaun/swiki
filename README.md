# swiki

A structured wiki designed to be flexible and easy to use.

# Documents

Each document has a title, summary, sections, attributes and references. 

**Title**

This is the overall title of the document. This should not be editable without some warning to the end user. All links between ducments are via title. When a title is edited all links need updated.

**Sections**

Sections are blocks of content for a document. Each block of content has a type that helps structure the overall document and makes the underlying data easier to manipulate outside of the wiki. Some types of content are Text, Media, List, Tabel, etc.

> **Text**

> A text block can is just that a block of text for the document, think a chapter, or a titled section in a report. The text can have some minor formating ** __ `` that is easly removable as well as links [], attributes () and references {}. Other items such as lists and tables are not supported in markup they use their own section type.

**Attributes**

These are typed informaiton such as a date, phone number, ISBN, dollar amount, etc.

**References**

Citations to external resources what the document was based on
