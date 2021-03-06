;(function name(_win) {
  function init(rps) {
    var MAKE = go.GraphObject.make; //构建GoJS对象
    //参数设置 https://gojs.net/latest/api/symbols/Diagram.html
    myDiagram = MAKE(go.Diagram, "J_chartArea",
      //图表整体属性设置
      {
        initialContentAlignment: go.Spot.Center, //设置整个图表在容器中的位置 https://gojs.net/latest/api/symbols/Spot.html
        allowZoom: true,
        "grid.visible": false, //是否显示背景栅格
        "grid.gridCellSize": new go.Size(5, 5), //栅格大小
        "commandHandler.copiesTree": false, // 禁用复制快捷键
        "commandHandler.deletesTree": false, // 禁用删除快捷键
        "toolManager.mouseWheelBehavior": go.ToolManager.WheelZoom, //启用视图放大缩小
        allowLink: false, //是否允许拖拽连线
        allowRelink: false, //是否允许重新连线
        padding: 10,
        //布局设置 https://gojs.net/latest/api/symbols/Layout.html
        //LayeredDigraphLayout布局 https://gojs.net/latest/api/symbols/LayeredDigraphLayout.html
        layout: MAKE(go.LayeredDigraphLayout, {
          direction: 0,
          layeringOption: go.LayeredDigraphLayout.LayerLongestPathSource
        }), //0向右，90向下，180向左，270向上。默认值是0
        "undoManager.isEnabled": false //是否启用撤销回退 Ctrl-Z Ctrl-Y
      });
    myDiagram.linkTemplate =
      //设置连接线 https://gojs.net/latest/intro/links.html
      MAKE(go.Link,
        //设置连接线属性
        {
          relinkableFrom: true,
          relinkableTo: true,
          corner: 12,
          routing: go.Link.Orthogonal,
          curve: go.Link.JumpOver
        },
        MAKE(go.Shape, {
          stroke: "#46bee9",
          strokeWidth: 2
        }),
        //设置箭头
        MAKE(go.Shape, {
          toArrow: "Standard",
          stroke: "#46bee9",
          fill: "#46bee9"
        })
      );
    myDiagram.nodeTemplate =
      MAKE(go.Node, "Horizontal", //将多个GraphObjects比如下面的Panel和Button元素垂直对齐还是水平对齐
        {
          portId: "",
          fromLinkable: true,
          toLinkable: true
        },
        MAKE(go.Panel, "Table", {
            defaultAlignment: go.Spot.Left
          },
          //图片元素设置-背景图 https://gojs.net/latest/intro/pictures.html
          MAKE(go.Picture, {
              width: 208,
              height: 102
            },
            new go.Binding("source", "bgSrc")),
          MAKE(go.Panel, "Table", {
              defaultAlignment: go.Spot.Left
            },
            MAKE(go.RowColumnDefinition, {
              column: 0,
              width: 48
            }),
            //设置文本块元素-标题
            MAKE(go.TextBlock, {
                row: 0, //所在行
                column: 1, //所在列
                columnSpan: 2, //合并列
                fromLinkable: false,
                toLinkable: false,
                alignment: go.Spot.Left, //文本对齐
                stroke: "#fff", //颜色
                margin: new go.Margin(5, 0, 0, 5), //边距
                font: "12pt helvetica, arial, sans-serif" //文字样式
              },
              new go.Binding("text", "title") //绑定数据
            ),
            //设置图片-Icon小图标
            MAKE(go.Picture, {
                row: 1,
                column: 0,
                width: 48,
                height: 48,
                background: "transparent",
                alignment: go.Spot.Center,
                margin: new go.Margin(0, 0, 0, 5)
              },
              new go.Binding("source", "iconSrc")),
            //设置文本块-详情
            MAKE(go.TextBlock, {
                row: 1,
                column: 1,
                stroke: "#fff",
                font: "8pt sans-serif",
                wrap: go.TextBlock.WrapFit, //文本换行
                desiredSize: new go.Size(150, 50), //期望的区域尺寸
                alignment: go.Spot.Left,
                margin: new go.Margin(5, 0, 0, 5)
              },
              new go.Binding("text", "text")
            )
          )
        ),
        //设置展开收缩按钮
        MAKE("Panel", {
            width: 12,
            height: 12
          },
          MAKE(go.Picture, {
              width: 12,
              height: 12,
              source: "./images/button.png"
            },
            new go.Binding("visible", "isTreeLeaf",
              function (leaf) {
                return !leaf;
              })
            .ofObject()),
          MAKE(go.Panel, "Table", {
              visible: false,
              desiredSize: new go.Size(12, 12)
            },
            //绑定自定义数据
            new go.Binding("visible", "isTreeLeaf",
              function (leaf) {
                return !leaf;
              })
            .ofObject(),
            MAKE(go.Shape, {
                name: "ButtonIcon",
                figure: "MinusLine", //自动生成几何图形 这里生成“-”
                desiredSize: new go.Size(7, 7) //尺寸
              },
              new go.Binding("figure", "isCollapsed", // 根据collapsed函数的返回值设置图形是“+”还是“-”
                function (collapsed) {
                  return collapsed ? "PlusLine" : "MinusLine";
                })), {
              click: function (e, obj) {
                e.diagram.startTransaction();
                var node = obj.part;
                if (node.data.isCollapsed) {
                  expandFrom(node, node);
                } else {
                  collapseFrom(node, node);
                }
                e.diagram.commitTransaction("toggled visibility of dependencies");
              }
            }
          )
        )
      );
    //收缩
    function collapseFrom(node, start) {
      if (node.data.isCollapsed) return;
      node.diagram.model.setDataProperty(node.data, "isCollapsed", true);
      if (node !== start) node.visible = false;
      node.findNodesOutOf().each(collapseFrom);
    }
    //展开
    function expandFrom(node, start) {
      if (!node.data.isCollapsed) return;
      node.diagram.model.setDataProperty(node.data, "isCollapsed", false);
      if (node !== start) node.visible = true;
      node.findNodesOutOf().each(expandFrom);
    }
    //数据
    myDiagram.model = new go.GraphLinksModel(rps[0], rps[1]);
    //绑定元素点击事件
    myDiagram.addDiagramListener("ObjectSingleClicked",
      function (e) {
        var part = e.subject.part;
        if (!(part instanceof go.Link)) {
          console.info(part.data.key)
        }
      });
  }
  _win.onload = function () {
    init(DEMO_JSON_DATA);
  }
})(window);
