var width = 700 , height = 750 ,
    projection = d3.geo.mercator()
  					.center([-73.94, 40.70])
  					.scale(60000)
  					.translate([(width) / 2, (height)/2]);
  
var color = d3.scale.category20(),
    colorScale = d3.scale.threshold()
                   .domain([40, 50, 60, 70, 80])
                   .range(["#f2f0f7", "#dadaeb", "#bcbddc", "#9e9ac8", "#756bb1", "#54278f"]);
    
 

// console.log("color", color)

var path = d3.geo.path()
			.projection(projection);
			
queue()
      .defer(d3.json, "https://raw.githubusercontent.com/txyzy1232006/Interactive-map/master/nyc_district.json")
      .defer(d3.json, "https://raw.githubusercontent.com/txyzy1232006/Interactive-map/master/Graduation.json")
      .await(ready);
     
function ready(error, nyd, grad){
  var data2 = grad.filter(function(d) { 
      return d.District == 1;
  });
  // console.log("data2",data2)
  
  var chart1 = c3.generate({
    bindto: '#chart1',
    data: {
        json: data2,
        keys: {
          x: 'Year',
          value: ['Graduation Rate', 'Still Enrolled', 'Dropout','SACC','TASC'],
        },
        type: 'bar',
        groups: [
            ['Graduation Rate', 'Still Enrolled', 'Dropout','SACC','TASC']
        ],
        order: false
    },
    tooltip: {
      show: true
    },
    axis: {
        x: {
            type: 'category',
            label: {
                text: 'Year',
                position: 'outer-center'
            }
        },
        y: {
            label: {
                text: 'Proportion(%)',
                position: 'outer-top'
            }
          
        }
        
        // rotated: true,
        
    },
    // console.log(x)
  });
  
  var chart2 = c3.generate({
    bindto: '#chart2',
    data: {
        json: data2,
        keys: {
          x: 'Year',
          value: ['Local', 'Regent without Advanced', 'Advanced Regent','Graduation Rate'],
        },
        type: 'bar',
        types: {
            'Graduation Rate': 'spline',
        },
        groups: [
            ['Local','Regent without Advanced', 'Advanced Regent']
        ],
        order: false
    },
    tooltip: {
      show: true
    },
    axis: {
        x: {
            type: 'category',
            label: {
                text: 'Year',
                position: 'outer-center'
            }
        },
        y: {
            label: {
                text: 'Proportion(%)',
                position: 'outer-top'
            }
          
        }
            
        
        // rotated: true,
        
    }
  });
  
  
  var data3 = grad.filter(function(d) { 
      return d.Year == 2012;
  });
  // console.log("data3",data3)
  
  var rateByDistrict = {};
  
  data3.forEach(function(d) { 
    rateByDistrict[d.District] = +data3[d.District-1]["Graduation Rate"]; 
  });
  
  
  var svg = d3.select("#map").append("svg")
     .attr("width", width)
     .attr("height", height)

  var tooltip = d3.select("#tooltip"),
      tooltipBor = d3.select("#tooltipBor"),
      textbox1 = d3.select('#Dis')
                   .text("NYC Total"),
      textbox2 = d3.select('#Cohort')
                   .text("148344"),
      textbox3 = d3.select('#Grad')
                   .text("71.10%"),
      dfDis = d3.select("#defaultDis")
                .text("1"),
      dfBor = d3.select("#defaultB")
                .text("Manhattan"),
      bor = "Manhattan"
  
  svg.append("g")
		.attr("id", "district")
    .selectAll(".district")
    .data(nyd.features)
    .enter()
    .append("path")
    .style("stroke", "#FFFFFF")
    .style("stroke-width", 0.5)
    .style("fill", function(d) { 
      // return color(d.properties.schoolDistrict);
      return colorScale(rateByDistrict[d.properties.schoolDistrict]) ; 
     })
    .style('fill-opacity',1)
    .on("mouseover", function (d) {
        var dist = d.properties.schoolDistrict
        // var currentState = this;
        d3.selectAll('path').style('fill-opacity',function(d2){
          if (d2.hasOwnProperty('properties')){
          if (d.properties.schoolDistrict === d2.properties.schoolDistrict) { return .7 }
          else 	{ return 1 }}
          else { return 1}
        }); 
        
        var total = grad.filter(function(d){
            return d.Year == 2012 && d.District == dist;
        })
        
        textbox1.text(dist)
                .style("display", null)
        textbox2.text(total[0].Total)
                .style("display", null)
        textbox3.text(parseInt(total[0]["Graduation Rate"]*100)/100+"%")
                .style("display", null)
        
    })
    .on("click", function(d){
        var dis = d.properties.schoolDistrict
        if (dis>=7 && dis<=12){
          bor = "Bronx"
        } else if ((dis>=13 && dis<=23) || dis==32 ){
          bor = "Brooklyn"
        } else if (dis>=24 && dis<=30){
          bor = "Queens"
        } else if (dis == 31){
          bor = "Staten Island"
        } else {
          bor = "Manhattan"
        }
        
        tooltip.style("display", null);
        tooltip.text(d.properties.schoolDistrict);
        tooltipBor.text(bor);
        dfDis.style("display", "none");
        dfBor.style("display", "none");
        
        // TODO: reload charts
        var data1 = grad.filter(function(d3) {return d3.District == dis});
        console.log("change",data1)
        // chart1.unload({});
        chart1.load({ json: data1,
                      keys: {
                            x: 'Year',
                            value: ['Graduation Rate', 'Still Enrolled', 'Dropout','SACC','TASC'],
                      },
                      type: 'bar',
                      groups: [['Graduation Rate', 'Still Enrolled', 'Dropout','SACC','TASC']],
                      order: false 
        });
        // chart2.unload({});
        chart2.load({ json: data1,
                      keys: {
                            x: 'Year',
                            value: ['Local', 'Regent without Advanced', 'Advanced Regent','Graduation Rate'],
                      },
                      type: 'bar',
                      types: {
                            'Graduation Rate': 'spline',
                      },
                      groups: [ ['Local','Regent without Advanced', 'Advanced Regent']
                      ],
                      order: false  
        });
        
    })
    .on("mouseout", function () {
        d3.selectAll('path').style('fill-opacity',1); 
        // tooltip.style("display", "block");
        // tooltipBor.style("display", "block");
        // textbox1 = d3.text("NYC Total").style("display", "inline")
        // textbox2 = d3.text("148344").style("display", null)
        // textbox3 = d3.text("71.10%").style("display", null)
        
        
        
    })
    .attr("d", path)
  
  
  // legend of map
  var gridSize = Math.floor(width / 25),
      legendElementWidth = gridSize*1.5
  console.log("color", Math.round(40))  
  
  var legend = d3.select("#legend").append("svg")
              .attr("width",legendElementWidth*6)
              .attr("height", gridSize*2)
              .append("g")
              .selectAll(".legend")
              .data([0].concat([40, 50, 60, 70, 80]))
              .enter()
              .append("g")
              .attr("class", "legend");
  
  legend.append("rect")
        .attr("x", function(d, i) { return legendElementWidth * i; })
        .attr("y", 0)
        .attr("width", legendElementWidth)
        .attr("height", gridSize / 2)
        .style("fill", function(d) { return colorScale(d); });
        
  legend.append("text")
        .attr("class", "mono")
        .text(function(d) { return "≥ " + Math.round(d) + "%"; })
        .attr("x", function(d, i) { return legendElementWidth * i; })
        .attr("y", gridSize);
  

}


    
	   

