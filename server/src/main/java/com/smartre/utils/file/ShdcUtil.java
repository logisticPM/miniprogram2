package com.smartre.utils.file;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "shdc")
public class ShdcUtil {

    public static String uploadDir;

    public static String filestorePath;

    public static String getUploadDir() {
        return uploadDir;
    }

    public void setUploadDir(String uploadDir) {
        ShdcUtil.uploadDir = uploadDir;
    }

    public static String getFilestorePath() {
        return filestorePath;
    }

    public void setFilestorePath(String filestorePath) {
        ShdcUtil.filestorePath = filestorePath;
    }
} 