@echo off
echo 正在推送代码到GitHub仓库：https://github.com/logisticPM/miniprogram.git

git remote add github https://github.com/logisticPM/miniprogram.git
git push -u github master

echo 完成！
pause 