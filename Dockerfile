# 使用官方 Node.js 18 Alpine 镜像作为基础镜像
FROM node:18-alpine AS base

# 安装 pnpm
RUN npm install -g pnpm

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./

# 安装依赖
RUN pnpm install --frozen-lockfile

# 复制源代码
COPY . .

# 构建阶段
FROM base AS builder

# 设置环境变量
ENV NODE_ENV=production
ENV NITRO_PRESET=node_cluster

# 构建应用
RUN pnpm build

# 生产阶段
FROM node:18-alpine AS production

# 安装 pnpm
RUN npm install -g pnpm

# 创建非 root 用户
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nuxt -u 1001

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./

# 只安装生产依赖
RUN pnpm install --prod --frozen-lockfile

# 从构建阶段复制构建产物
COPY --from=builder --chown=nuxt:nodejs /app/.output ./.output

# 切换到非 root 用户
USER nuxt

# 暴露端口
EXPOSE 3000

# 设置环境变量
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

# 启动应用
CMD ["node", ".output/server/index.mjs"]
