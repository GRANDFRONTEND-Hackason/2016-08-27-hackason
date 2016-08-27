var jsonData;

var bgColor = "#0E1925";
var defaultColor = "#e5e5e5";
var colors = [
    "#ffffff",
    "#ffebee",
    "#ffcdd2",
    "#ef9a9a",
    "#ef5350",
    "#e53935",
    "#b71c1c"
];

d3.select("body").style("background-color", bgColor);

var xhr = new XMLHttpRequest;
xhr.open('GET', 'json/data.json', true);
xhr.send(null);
xhr.onreadystatechange = function() {
    if( this.readyState == 4 && this.status == 200 ) {
        if( this.response ) {
            var res = this.response;
            jsonData = JSON.parse(res);
            displayMap();
            displayGraph();
        }
    }
}

// 日本地図の描画
function displayMap() {

    d3.select("svg").remove();
    var w = d3.select("body").node().getBoundingClientRect().width;
    var h = d3.select("body").node().getBoundingClientRect().height;

    // SVG要素生成
    var svg = d3.select("body")
        .append("svg")
        .attr("width", w)
        .attr("height", h);

    // 日本地図データ読み込み
    d3.json("../json/japan.topojson", function(json) {
        var japan = topojson.object(json, json.objects.japan).geometries;
     
        // 投影法設定
        var projection = d3.geo.mercator()
            .center([130.5, 32.4800774])
            .translate([w/2, h/2])
            .scale(10000);
     
        // 緯度経度⇒パスデータ変換設定
        var path = d3.geo.path()
            .projection(projection);
     
        // パスデータとして日本地図描画
        svg.selectAll("path")
        .data(japan)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("stroke", bgColor)
        .attr("stroke-width", 0.5)
        .style("fill", function(e, i) {
            return getAreaColor(e.properties.name_local);
        })
        .on("mouseover", function(e) {

            // 重ね順を最前に
            this.parentNode.appendChild(this);

            d3.select(this)
            .transition()
            .duration(100).ease('linear')
            .attr("opacity",1.0)
            .attr("transform","translate(0,-4)");

            for (var index in jsonData) {
                var areaData = jsonData[index];
                if (areaData.areaName == e.properties.name_local) {
                    // console.log(areaData.areaName);
                    // console.log(areaData.lat);
                    // console.log(areaData.lon);
                    // console.log(areaData.people);
                    // console.log(areaData.priority);
                    for (var index in areaData.resources) {
                        var item = areaData.resources[index];
                        // console.log(item.name);
                        // console.log(item.quantity);
                    }
                }
            }

            svg.append("rect")
            .attr("x",30)
            .attr("y",h - 300)
            .attr("width",500)
            .attr("height",260)
            .attr("fill","white")
            .attr("rx", 10)
            .attr("ry", 10)
            .attr("opacity",0.8);
            
            svg.append("text")
            .html(e.properties.name_local)
            .attr('width', 50)
            .attr('height', 50)
            .attr('x', 40)
            .attr('y', h - 270);

            appendAreaInfo(e.properties.name_local, 40, h - 270);

        })
        .on("mouseout", function(e) {
            svg.select("rect").remove();
            svg.selectAll("text").remove();
            svg.selectAll(".icon").remove();

            d3.select(this)
            .transition()
            .duration(100).ease('linear')
            .attr("opacity",1.0)
            .attr("transform","translate(0,4)");
        });
    });

    var icon = d3.select("svg")
        .append('image')
        .attr('xlink:href', 'images/jiku.png')
        .attr('width', 45)
        .attr('height', 350)
        .attr('clip-path', 'url(#clip)')
        .attr('x', 40)
        .attr('y', 20);

}

function getAreaColor(areaName) {
    for (var index in jsonData) {
        var areaData = jsonData[index];
        if (areaData.areaName == areaName) {
            return colors[areaData.priority - 1];
        }
    }
    return defaultColor;
}

// アイコンの取得
function displayIcon(index, x, y, width, height) {

    var images = [
        'diaper_c.png',
        'list_c.png',
        'location_c.png',
        'onigiri_c.png',
        'priority_c.png',
        'tissue_c.png',
        'towel_c.png',
        'volume_c.png',
        'water_c.png',
        'ningen.png'
    ];

    var icon = d3.select("svg")
        .append('image')
        .attr('class', 'icon')
        .attr('xlink:href', 'images/' + images[index])
        .attr('width', width)
        .attr('height', height)
        .attr('clip-path', 'url(#clip)')
        .attr('x', x)
        .attr('y', y);
}

/**
 * 県名から県のデータを取得
 */
function getAreaData(areaName) {
  for (var i in jsonData) {
    var areaData = jsonData[i]
    if (areaData.areaName == areaName) {
      return areaData;
    }
  }
}

function appendAreaInfo(areaName, x, y) {
  var areaData = getAreaData(areaName);
  var areaName = areaData.areaName;
  var resources = areaData.resources;
  var people = areaData.people;
  var priority = areaData.priority;

  var originX = x;
  var originY = y;

  appendText(areaName, x, originY);
  originY += 25;
  appendText("優先順位 : " +  priority, x, originY);
  originY += 25;
  appendText("避難人数 : 100", x, originY);
  originY += 25;
  appendText("必要物資", x, originY);
  originY += 30;

  var resourceCount = 0;
  for (var i in resources) {
      var resource = resources[i];
      var quantity = resource.quantity;
      var name = resource.name;

      if (quantity > 0) {
          var resourceInfo = "　 　　" + " ✕ " + quantity;
          appendText(resourceInfo, originX, originY);
          var index = iconIndexFromName(name);
          displayIcon(index, originX, originY - 25, 50, 50);
          if (resourceCount % 2 == 0) {
              originX += 200;
          } else {
              originX = x;
              originY += 50;
          }
          resourceCount++;
      }
  }

  if (resourceCount == 0) {
      var resourceInfo = "　　なし";
      appendText(resourceInfo, x, originY);
      originY += 25;
  }

}

function appendText(text, x, y) {
  var svg = d3.select("svg");
  svg.append("text")
  .html(text)
  .attr('width', 100)
  .attr('height', 100)
  .attr('x', x)
  .attr('y', y);
}

// 円グラフ表示
function displayGraph() {
    // 表示サイズを設定
    var size = {
      width: 400,
      height:400
    };

    // 円グラフの表示データ
    var data = [
        {legend:"おにぎり", value:40, color:"#e74c3c"},
        {legend:"水", value:10, color:"#f39c12"},
        {legend:"おむつ", value:15, color:"#16a085"},
        {legend:"ティッシュ", value:25, color:"#d35400"},
        {legend:"タオル", value:30, color:"#2c3e50"}
    ];

    // SVG要素生成
    var svg = d3.select("body")
        .append("svg")
        .attr("id", "chart");

    // d3用の変数
    var svg = d3.select("#chart"),
        pie = d3.layout.pie().sort(null).value(function(d){ return d.value; }),
        arc = d3.svg.arc().innerRadius(0).outerRadius(size.width / 2);

    // グループの作成
    var g = svg.selectAll(".arc")
        .data(pie(data))
        .enter()
        .append("g")
        .attr("transform", "translate(" + (size.width / 2) + "," + (size.width / 2) + ")")
        .attr("class", "arc");

    // 円弧の作成
    g.append("path")
        .attr("d", arc)
        .attr("stroke", "white")
        .attr("fill", function(d){console.log(arc.centroid(d)); return d.data.color; });

    // データの表示
    var maxValue = d3.max(data,function(d){ return d.value; });

    // データの表示
    g.append("text")
        .attr("dy", ".35em")
        .attr("font-size", function(d){ return d.value / maxValue * 20; })
        .style("text-anchor", "middle")
        .text(function(d){ return d.data.legend; });

    // テキストの位置を再調整
    g.selectAll("text").attr("transform", function(d){ return "translate(" + arc.centroid(d) + ")"; });
}

function iconIndexFromName(name) {
  if (name == "おにぎり") {
      return 3;
  } else if (name == "水") {
      return 8;
  } else if (name == "おむつ") {
      return 0;
  } else if (name == "タオル") {
      return 6;
  } else if (name == "ティッシュ") {
      return 5;
  }
  return -1;
}
