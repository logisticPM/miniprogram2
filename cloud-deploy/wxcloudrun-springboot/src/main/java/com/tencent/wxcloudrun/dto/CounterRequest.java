package com.tencent.wxcloudrun.dto;

import lombok.Data;

@Data
public class CounterRequest {

  // `action`：`string` 类型，枚举值
  // 等于 `"inc"` 时，表示计数加一
  // 等于 `"clear"` 时，表示计数重置（清零）
  private String action;

  // 显式添加 getter 和 setter 方法，以防 Lombok 注解不起作用
  public String getAction() {
    return action;
  }

  public void setAction(String action) {
    this.action = action;
  }
}
