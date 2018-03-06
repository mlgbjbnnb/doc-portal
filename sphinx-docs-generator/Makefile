# Makefile for Sphinx documentation
#

# You can set these variables from the command line.
VERSION       = $(shell cat ../../doc_source/VERSION.txt)
LANG          = $(shell cat ../../doc_source/LANG.txt)
SPHINXOPTS    = -D version=$(VERSION) -j 4
SPHINXBUILD   = sphinx-build
BUILDDIR      = ../../build
SPHINXWATCH   = sphinx-autobuild -q -p 0  --open-browser --delay 0

# User-friendly check for sphinx-build
#ifeq ($(shell which $(SPHINXBUILD) >/dev/null 2>&1; echo $$?), 1)
#$(error 程序 '$(SPHINXBUILD)' 没有安装。请检查配置
#endif

# Internal variables.
PAPEROPT_a4     = -D latex_paper_size=a4
PAPEROPT_letter = -D latex_paper_size=letter
#ALLSPHINXOPTS   = -d $(BUILDDIR)/doctrees $(PAPEROPT_$(PAPER)) $(SPHINXOPTS) .
# the i18n builder cannot share the environment and doctrees with the others
#I18NSPHINXOPTS  = $(PAPEROPT_$(PAPER)) $(SPHINXOPTS) .

ALLSPHINXOPTS   = -d $(BUILDDIR)/doctrees/$(LANG)/$(VERSION) $(PAPEROPT_$(PAPER)) $(SPHINXOPTS) ../../doc_source

.PHONY: help clean html pdf dirhtml singlehtml pickle json htmlhelp qthelp devhelp epub latex latexpdf text man changes linkcheck doctest coverage gettext

help:
	@echo "Please use \`make <target>' where <target> is one of"
	@echo "  html       将源文件编译为html"
	@echo "  watch      编辑模式。会监测源文件更改，自动编译"
	@echo "  dirhtml    to make HTML files named index.html in directories"
	@echo "  singlehtml to make a single large HTML file"
	@echo "  pickle     to make pickle files"
	@echo "  json       to make JSON files"
	@echo "  htmlhelp   to make HTML files and a HTML help project"
	@echo "  qthelp     to make HTML files and a qthelp project"
	@echo "  applehelp  to make an Apple Help Book"
	@echo "  devhelp    to make HTML files and a Devhelp project"
	@echo "  epub       to make an epub"
	@echo "  latex      to make LaTeX files, you can set PAPER=a4 or PAPER=letter"
	@echo "  latexpdf   to make LaTeX files and run them through pdflatex"
	@echo "  latexpdfja to make LaTeX files and run them through platex/dvipdfmx"
	@echo "  text       to make text files"
	@echo "  man        to make manual pages"
	@echo "  texinfo    to make Texinfo files"
	@echo "  info       to make Texinfo files and run them through makeinfo"
	@echo "	 intel		to export PO"
	@echo "  gettext    to make PO message catalogs"
	@echo "  changes    to make an overview of all changed/added/deprecated items"
	@echo "  xml        to make Docutils-native XML files"
	@echo "  pseudoxml  to make pseudoxml-XML files for display purposes"
	@echo "  linkcheck  to check all external links for integrity"
	@echo "  doctest    to run all doctests embedded in the documentation (if enabled)"
	@echo "  coverage   to run coverage check of the documentation (if enabled)"

clean:
	rm -rf $(BUILDDIR)/html/$(LANG)/$(VERSION)
	rm -rf $(BUILDDIR)/xml/$(LANG)/$(VERSION)

clean-all:
	rm -rf $(BUILDDIR)/*

html:
	# 不止是编译为HTML。
	# 1. 编译为XML
	# 2. 读取XML中的meta信息
	# 3. 构建目录树
	# 4. 编译为HTML
	make clean
	make xml
	python make-json-menu.py
	$(SPHINXBUILD) -b html $(ALLSPHINXOPTS) $(BUILDDIR)/html/$(LANG)/$(VERSION)/_bare
	cp -rf $(BUILDDIR)/html/$(LANG)/$(VERSION)/_bare/_images $(BUILDDIR)/html/$(LANG)/$(VERSION)/_images
	@echo
	@echo "构建完成。HTML文件在 $(BUILDDIR)/html/$(LANG)/$(VERSION)/"

singlehtml:
	$(SPHINXBUILD) -b singlehtml $(ALLSPHINXOPTS) $(BUILDDIR)/singlehtml
	@echo
	@echo "Build finished. The HTML page is in $(BUILDDIR)/singlehtml."

xml:
	make clean
	$(SPHINXBUILD) -b xml $(ALLSPHINXOPTS) $(BUILDDIR)/xml/$(LANG)/$(VERSION)/
	@echo
	@echo "Build en finished. The HTML pages are in $(BUILDDIR)/xml/en/$(VERSION)/"
