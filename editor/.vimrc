" 设置 Vim 内部使用的编码为 UTF-8
set encoding=utf-8

" 如果系统语言环境是 UTF-8，设置文件编码检测顺序
if v:lang =~ "utf8$" || v:lang =~ "UTF-8$"
   set fileencodings=ucs-bom,utf-8,latin1
endif

" 使用 Vim 的默认行为（而不是 Vi 的兼容模式）
set nocompatible

" 允许在插入模式下退格删除缩进、换行符和起始字符
set bs=indent,eol,start

" 设置 Vim 信息文件的读写选项
set viminfo='20,\"50

" 保留 50 行的命令历史记录
set history=50

" 始终显示光标位置
set ruler

" 如果支持自动命令，设置一些自动行为
if has("autocmd")
  augroup redhat
  autocmd!
  " 在 NFS 挂载或 USB 设备上编辑文件时，将交换文件保存到指定目录
  autocmd BufNewFile,BufReadPre /media/*,/run/media/*,/mnt/* set directory=~/tmp,/var/tmp,/tmp
  " 新建 .spec 文件时，自动插入模板内容
  autocmd BufNewFile *.spec 0r /usr/share/vim/vimfiles/template.spec
  augroup END
endif

" 如果支持 cscope 并且 cscope 可执行文件存在，设置 cscope 相关选项
if has("cscope") && filereadable("/usr/bin/cscope")
   set csprg=/usr/bin/cscope
   set csto=0
   set cst
   set nocsverb
   " 如果当前目录有 cscope.out 数据库，加载它
   if filereadable("cscope.out")
      cs add $PWD/cscope.out
   " 否则加载环境变量指定的数据库
   elseif $CSCOPE_DB != ""
      cs add $CSCOPE_DB
   endif
   set csverb
endif

" 如果终端支持颜色或运行在 GUI 模式下，启用语法高亮和搜索高亮
if &t_Co > 2 || has("gui_running")
  syntax on
  set hlsearch
endif

" 启用文件类型插件
filetype plugin on

" 如果终端是 xterm，设置终端颜色和光标样式
if &term=="xterm"
     set t_Co=8
     set t_Sb=m
     set t_Sf=m
endif

" 禁用光标闪烁，避免唤醒系统
let &guicursor = &guicursor . ",a:blinkon0"