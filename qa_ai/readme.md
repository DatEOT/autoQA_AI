docker build -t qa_fastapi_app .

docker run -d --restart always -p 55036:55036 --name qa_fastapi_container qa_fastapi_app

docker save -o api_web_leech_truyen_audio.tar api_web_leech_truyen_audio

docker load -i api_web_leech_truyen_audio.tar

docker exec -it api_web_leech_truyen_audio bash

python -m venv ten_moi_truong
myproject_env\Scripts\activate

pip freeze > requirements.txt

Remove-Item -Path .git -Recurse -Force
