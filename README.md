# swiki

A structured wiki designed to be flexible and easy to use.

# API

* /document
  * GET - Retrive a list of documents
  * POST - Create a new document
* /document/{docId}
  * GET - Retrive a specific document, including all attributes and sections
  * PUT - Update a specific document (Not Implimented Yet)
* /document/{docId}/attribute
  * GET - Retrive a list of attributes for a document
  * POST - Create a new attribute for a document
* /document/{docId}/attribute/{attrId}
  * GET - Retrive a specific attribute for a document
  * PUT - Update a specific attribute for a document
* /document/{docId}/section
  * GET - Retrive a list of sections for a document
  * POST - Create a new section for a document
* /document/{docId}/section/{secId}
  * GET - Retrive a specific section for a document
  * PUT - Update a specific section for a document
* /history/{id}
  * GET - Retrive all revisons for an id
* /history/{id}/revision/{rev}
  * GET - Retrive a specific revison for an id
* /update
  * GET - Install or Update the database

# Documents

Each document has a title, abstract, sections, and attributes.

**Title**

This is the overall title of the document. This should not be editable without some warning to the end user. All links between documents are via title. When a title is edited all links need updated.

**Abstract**

A quick summary of the document.

**Sections**

Sections are blocks of content for a document. Each block of content has a type that helps structure the overall document and makes the underlying data easier to manipulate outside of the wiki. Some types of content are Text, Media, List, Table, etc.

**Attributes**

These are typed information such as a date, phone number, ISBN, dollar amount, etc.

**References**

Citations to external resources that the document cited.


# Attributes

TODO

# Sections

TODO

# System

The system is designed from the ground up to be run on Amazon's Web Services platform. This wiki will not work on a stand alone system and is not designed to be ported to other systems.

## Database

The database used is DynamoDB. This is a NoSQL key store provided by AWS. The database is accessd through a libray Dynamoos. The library provides schemas, models and some low level validation.

## Microservices

There are three microservices that make up the server backend. The are the `Document`, `History` and `Update` Lambda functions. Each function is accessed via Amazon's API Gateway.
