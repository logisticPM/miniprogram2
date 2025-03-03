package com.udeve.utils.file;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * 文件存储工具类
 */
@Component
@ConfigurationProperties(prefix = "shdc")
public class FileStorageUtil {

    private static String uploadDir;

    private static String filestorePath;

    public static String getUploadDir() {
        return uploadDir;
    }

    public void setUploadDir(String uploadDir) {
        FileStorageUtil.uploadDir = uploadDir;
    }

    public static String getFilestorePath() {
        return filestorePath;
    }

    public void setFilestorePath(String filestorePath) {
        FileStorageUtil.filestorePath = filestorePath;
    }
}