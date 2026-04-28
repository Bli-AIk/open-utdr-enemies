# 获取本机局域网 IP（排除 loopback）
lan_ip := `ip -4 addr show | grep -oP '(?<=inet\s)\d+(\.\d+){3}' | grep -v '127.0.0.1' | head -1`
port := "1111"

# 本地开发服务（默认）
serve:
    zola serve --port {{port}}

# 局域网服务（手机等设备可访问）
serve-lan:
    @echo "局域网访问地址: http://{{lan_ip}}:{{port}}"
    zola serve --interface 0.0.0.0 --port {{port}} --base-url http://{{lan_ip}}:{{port}} --no-port-append

# 构建静态站点
build:
    zola build

# 检查站点（不输出文件）
check:
    zola check

# 清理构建产物
clean:
    rm -rf public/

# 初始化 AdiDoks 主题
init-theme:
    ./scripts/init_adidoks.sh

# 抓取 Bilibili 动态并归档
fetch-opus opus_id:
    python3 scripts/fetch_bilibili_opus.py \
      --opus-id {{opus_id}} \
      --output content/docs/articles/opus-{{opus_id}}.md \
      --json-output data/bilibili/{{opus_id}}.json

# Generate UTRP fixtures and framework starter snippets
generate-utrp:
    cargo run --manifest-path tools/utrp/Cargo.toml -- generate --all

# Test UTRP authoring and generation code
test-utrp:
    cargo test --manifest-path tools/utrp/Cargo.toml
