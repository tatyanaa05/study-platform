Этот каталог предназначен для интеграции внешних проектов.

Планируется разместить здесь подкаталог study-planner, подключённый как Git submodule:

- Репозиторий: https://github.com/tatyanaa05/study-planner.git

На момент добавления этого файла удалённый репозиторий пуст (не содержит коммитов), поэтому подмодуль временно не может быть подключён. Как только в удалённом репозитории появится хотя бы один коммит (и ветка по умолчанию, например main), выполните:

1) Добавление подмодуля:

   git submodule add -b main https://github.com/tatyanaa05/study-planner.git external/study-planner

2) Фиксация изменений:

   git add .gitmodules external/study-planner
   git commit -m "Add study-planner as a git submodule"

Альтернатива: использовать git subtree либо временно скопировать код (вендоринг) в external/study-planner с последующей заменой на submodule/subtree.
