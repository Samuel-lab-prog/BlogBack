## Blog Applicaton (Backend) ##
This repository contains the entire backend for The Blog application
### Tecnologies used ###
- Typescript as the main language
- PostgreSQL as the choosen database
- Bun as the choosen envoirment
### Main dependencies ###
- bycript for hashing
- jsonwebtoken for authenticating
- pg for dealing with the database
- elysia for Bun
- Slugify for dealing with post's titles
- ### Folder structure ###
In this project I'm using a variation of the MVC architeture:
- All files of envoriment configuration are in the root directory
- All relevant code is contained inside of the src folder
- Inside the src folder, you'll find 3 main types od folder: entity folders, database folders and utilities folders.
  
