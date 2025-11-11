#  Blog Application (Backend)

This repository contains the entire **backend** for the **Blog Application** project.

---

##  Technologies Used
- **TypeScript** — main programming language  
- **PostgreSQL** — chosen relational database  
- **Bun** — runtime environment  

---

##  Main Dependencies
- **bcrypt** — for password hashing  
- **jsonwebtoken (JWT)** — for user authentication  
- **pg** — for interacting with the PostgreSQL database  
- **elysia** — web framework for Bun  
- **slugify** — for generating clean slugs from post titles  

---

##  Folder Structure
- All environment configuration files are in the **root directory**  
- The main codebase is inside the **`src/`** folder  
- Inside `src/`, you’ll find three main types of folders:
  - **Entity folders**
  - **A single Database folders**
  - **A single utilities folders**

### Entity Folders
Entity folders contain all the logic necessary to handle a specific entity.  
For example, the `user` folder contains all logic related to user operations.  

Inside each entity folder, you’ll typically find **five** types of files:
- **models** — define the data structure and database models  
- **controllers** — handle the incoming requests and responses  
- **routes** — define API endpoints and connect them to controllers  
- **types** — contain TypeScript interfaces and type definitions  
- **services** — contain the business logic and database queries  

---
### Database Folder
This folder contains all the files necessary for configuring the database and representing
it's tables. As the database continue to increase it's complexity, you may want to create subfolders
inside of this folder.

---
### Utilities Folder
This folder is used for containing utilites files in general, such classes or funcions that you can reuse.
As this folder continues to grow, you might want to detach some files and organize them inside a new folder

##  How to Run Locally

### 1.Clone the repository
```
git clone https://github.com/yourusername/blog-backend.git
cd blog-backend
```
### 2.Install dependencies
```
bun install
```
### 3.Configure envoirment variables
```
DB_NAME=yourLocalDbName
DB_PASSWORD=yourLocalDbPassword
```
And so on...
### 4.Run the local development server
```
npm run dev
```
## Good practices and code style
This project follows several standards and patterns to ensure clean, maintainable, and scalable code — making it easier for anyone to contribute and understand.
### Commits patterns
 -1. Use a prefix for every commit. Commomn prefixes include:
   -feat: → for new features
   -fix: → for bug fixes
   -refactor: → for code restructuring without changing functionality
   -docs: → for documentation changes
   -style: → for formatting or code style adjustments
   -test: → for adding or updating tests
 -2. Keep commits focused: Each commit should address only one clear purpose.
     Avoid large, mixed commits — instead, split them into smaller, well-defined ones.
 -3. Write meaningful commit messages:
     Bad: fix stuff
     Good: fix: resolve user authentication token validation issue
### Coding patterns
-1. Always use the command ```npm run format``` to format your code before commiting. This ensures consistent code style across the entire project.
-2. Keep logic where it belongs. There shouldn't be a SELECT query in a route file.
-3. Write error proof. Assume that anything that can fail will fail.
    Use try/catch blocks when dealing with asynchronous code or external resources (like the database or API calls).
-4. Avoid unecesseary variables. If a value is only used once or is easily readable inline, don’t assign it to a variable.
-5. Keep functions small and focused: Each function should do one thing well.
    If a function is getting too long or has multiple responsibilities, break it into smaller helper functions.
-6. 




