docker build -t api_web_leech_truyen_audio .

docker run -d --restart always -v /root/dir*api_web_leech_truyen_audio:/\_app*/utils/download --name api_web_leech_truyen_audio -p 60074:60074 api_web_leech_truyen_audio

docker save -o api_web_leech_truyen_audio.tar api_web_leech_truyen_audio

docker load -i api_web_leech_truyen_audio.tar

docker exec -it api_web_leech_truyen_audio bash

python -m venv ten_moi_truong
myproject_env\Scripts\activate

pip freeze > requirements.txt

Remove-Item -Path .git -Recurse -Force

docker build -t react-app:dev .
docker run -p 3000:3000 react-app:dev
