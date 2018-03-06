#-*-coding: utf8
import xml.etree.ElementTree as ET
import json
import os
import sys

path_root = "../.."

folder_doc_source = "doc_source"
path_doc_source = path_root + "/" + folder_doc_source

version = open(path_doc_source + '/VERSION.txt', 'r').read().strip()
lang = open(path_doc_source + '/LANG.txt', 'r').read().strip()

path_build = path_root +"/build"
path_xml_build = path_build + "/xml/" + lang + "/" + version
path_html_build = path_build + "/html/" + lang + "/" + version

print "xxxxxx", path_xml_build, path_html_build

# 载入category
category_json = open(path_doc_source + '/category.json', 'r').read()
category_data = json.loads(category_json)

class ArticleCollection:
  def __init__(self, name):
    self.name = name
    self.menu = {}
    self.menu["data"] = []
    self.menu["category"] = category_data["category"]
  def addArticle(self, pathToXmlFile):
    article = {}
    #修正特殊字符问题
    content = open(pathToXmlFile, "r").read()
    if content.find("") != -1:
      content = content.replace("", "")
      open(pathToXmlFile, "w").write(content)
    tree = ET.parse(pathToXmlFile)
    root = tree.getroot()
    article["link"] = root.attrib["source"].split("/doc_source/")[1][:-4]
    for child in root:
      if child.tag == "meta" and child.attrib["name"]:
        tagName = child.attrib["name"].lower()
        tagValue = child.attrib["content"]
        if tagName in ["link", "title", "description"]:
          article[tagName] = tagValue
        else:
          article[tagName] = article.get(tagName, [])
          article[tagName].append(tagValue.lower())
    self.menu["data"].append(article)
  def toJSON(self):
    return json.dumps(self.menu, indent = 2)
  def toUrlMap(self):
    urls = []
    for article in self.menu["data"]:
      grabUrl =  "/" + version + "/_bare/" + article["link"] + ".html"
      linkUrl =  "/" + version + "/" + article["link"][:article["link"].index("/")] + article["link"][article["link"].index("/"):] + ".html"
      urls.append({"grabUrl": grabUrl, "linkUrl": linkUrl})
    return json.dumps({"urls": urls}, indent = 2)

if __name__ == "__main__":
  collection_all = ArticleCollection("all")
  collections = {}

  # 遍历源文件
  for root, subFolders, files in os.walk(path_xml_build):
    "files就是遍历的xml文件。需要剔除主页"
    print "进入文件夹 - ", root
    basename = os.path.basename(root)
    for filename in files:
      filepath = os.path.join(root , filename)
      fileext = os.path.splitext(filename)
      if fileext[1] == ".xml":
        if filename != "index.xml":
          print "建立索引", filepath
          collection_all.addArticle(filepath)
          if basename not in collections:
            collections[basename] = ArticleCollection(basename)
          # print "加入文件集合", filepath, "=>", basename
          collections[basename].addArticle(filepath)
      else:
        print "忽略文件", filepath

  #建立目录文件夹
  if not os.path.exists(path_html_build):
      try:
          os.makedirs(path_html_build)
      except OSError as exc: # Guard against race condition
          if exc.errno != errno.EEXIST:
              raise

  # 写入目录
  menupath = path_html_build + "/menu_" + collection_all.name + ".json"
  print "正在写入目录文件 " + menupath
  f = open(menupath, "w")
  f.write(collection_all.toJSON())
  f.close()

  searchConfigPath = path_html_build + "/searchConfig.json"
  print "正在写入搜索文件 " + searchConfigPath
  f = open(searchConfigPath, "w")
  f.write(collection_all.toUrlMap())
  f.close()

  for name in collections:
    collection = collections[name]
    menupath = path_html_build + "/menu_" + collection.name + ".json"
    print "正在写入目录文件 " + menupath
    f = open(menupath, "w")
    f.write(collection.toJSON())
    f.close()

  print "==== 生成目录文件成功 ===="
