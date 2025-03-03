@echo off
echo 正在打包微信云托管部署文件...

REM 创建部署包目录
if not exist deploy mkdir deploy

REM 打包后端服务
echo 打包后端服务...
cd wxcloudrun-springboot
powershell Compress-Archive -Path * -DestinationPath ..\deploy\wxcloudrun-springboot.zip -Force
cd ..

REM 打包小程序
echo 打包小程序...
cd weapp
powershell Compress-Archive -Path * -DestinationPath ..\deploy\weapp.zip -Force
cd ..

REM 打包云函数
echo 打包云函数...
cd cloudfunctions
powershell Compress-Archive -Path * -DestinationPath ..\deploy\cloudfunctions.zip -Force
cd ..

REM 复制文档
echo 复制文档...
copy README.md deploy\
copy DEPLOY_GUIDE.md deploy\

echo 打包完成！文件已保存到deploy目录。
echo 请按照DEPLOY_GUIDE.md中的说明进行部署。
pause 