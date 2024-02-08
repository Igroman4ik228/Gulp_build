# Gulp-builder :)

<p align="center">
      <img src="https://i.ibb.co/XWBFwjN/gulp-tutorial.jpg" width="726">
</p>
> Используется Gulp 4

## :zap: Начало работы
Перед началом *обязательно* установите [NodeJS](https://nodejs.org/en/) **LTS***
Для работы с данной сборкой в новом проекте, склонируйте все содержимое репозитория <br>
`git clone https://github.com/Igroman4ik228/Gulp_build.git`
Затем, находясь в корне проекта, запустите команду `npm i`, которая установит все находящиеся в package.json зависимости.
После этого вы можете использовать любую из четырёх предложенных команд сборки: <br>

`gulp` - базовая команда, которая запускает сборку для разработки, используя browser-sync

`gulp docs` - команда для продакшн-сборки проекта. Все ассеты сжаты и оптимизированы для выкладки на хостинг.

`gulp zipdocs` - команда для быстрой и автоматической упаковки всех файлов из папки __docs__ в архив docs.zip

`gulp zip` - команда для быстрой и автоматической упаковки всех нужных файлов для передачи другому разработчику в архив archive.zip

## :open_file_folder: Файловая структура
```
gulp-html-starter
├── build
├── docs
├── src
│   ├── html
│   │   └── blocks
│   ├── files
│   ├── fonts
│   ├── img
│   │   └── favicons
│   ├── js
│   │   └── modules
│   ├── scss
│   │   ├── base
│   │   └── blocks
├── .gitignore
├── gulpfile.js
├── LICENSE
├── package.json
└── webpack.config.js
```
