function connectToServer(callback){

  var prod1 = document.getElementById("prod1").value;
      prod2 = document.getElementById("prod2").value;
      prod3 = document.getElementById("prod3").value;

  var url =
  "http://webservice.gvsi.com/gvsi/xml/getdaily?output=text&daysback=50&includeheaders=false&fields=symbol,description,last&symbols="+prod3+","+prod2+","+prod1;

  var quote_data = new XMLHttpRequest();
  quote_data.open("GET", url, true);
  quote_data.setRequestHeader('Authorization', 'Basic '+btoa('AMPHORAAPI'+':'+'amphora'));
  quote_data.send();
  quote_data.onreadystatechange = function (){
    if (quote_data.readyState == 4 && quote_data.status == 200) {
      console.log('HTTP Request Works Fine.');
      callback(quote_data.responseText);
      console.log("HTTP Request Done.");
      }
  }
}

function getPrice(alltext){
  var lines_full = alltext.split("\n");
  var len = lines_full.length;
  var lines = lines_full.slice(0, len-2);//only keep the data
  var k = 0, j = 1;
  var curnt_line, next_line;
  var data = {
      1: [],
      2: [],
      3: []//,
      //4: [],
      //5: []
  };
  var name = {
      1: [],
      2: [],
      3: []//,
      //4: [],
      //5: []
  };


  for (k=0; k<=lines.length - 2; k++){
    curnt_line = lines[k].split(",");
    next_line = lines[k+1].split(",");
    if (curnt_line[0] == next_line[0]){
        //current line daily price belong to data array j
        data[j].push(curnt_line[2]);
    }
    else{
        //current line daily price belong to data array j, next line belongs to data array j+1
        data[j].push(curnt_line[2]);
        name[j].push(curnt_line[1]);
        j = j+1;
    }
  }

  var last_line = lines[lines.length - 1];
  var last_line_split = last_line.split(",");
  data[j].push(last_line_split[2]);
  name[j].push(last_line_split[1]);

  var daily_prices1, daily_prices2, daily_prices3;
  daily_prices1 = data[1];
  daily_prices2 = data[2];
  daily_prices3 = data[3];

  var len1 = daily_prices1.length;
  var len2 = daily_prices2.length;
  var len3 = daily_prices3.length;

  var index =[];
  for (h=0; h<= len1; h++){
    index[h] = h;
  }

  var quoteprice1 = daily_prices1[len1 - 1];
  var quoteprice2 = daily_prices2[len2 - 1];
  var quoteprice3 = daily_prices3[len3 - 1];

  var combined1 = [name[1], quoteprice1];
  var combined2 = [name[2], quoteprice2];
  var combined3 = [name[3], quoteprice3];

  var numprice1 = [];
  var numprice2 = [];
  var numprice3 = [];

  for (var i = 0; i <= len1-1; i++){
    numprice1[i] = parseFloat(daily_prices1[i]);
  }

  for (i = 0; i <= len2-1; i++){
    numprice2[i] = parseFloat(daily_prices2[i]);
  }

  for (i = 0; i <= len3-1; i++){
    numprice3[i] = parseFloat(daily_prices3[i]);
  }

  var table = d3.select("#datatable").append("table");
      thead = table.append("thead");
      tbody = table.append("tbody");

  thead.append("th").text("Security");
  thead.append("th").text("Latest Price");
  thead.append("th").text("50 Days Historical Prices");

  var tr = tbody.selectAll("tr").data([1])
      .enter().append("tr");

  ////==========ROW 1==========
  var td = tr.selectAll("td")
            .data(combined1)
            .enter().append("td")
            .text(function(d) { return d; });

  var width = 300;
  var height = 50;
  var mx = 10;
  var radius = 2;

  d3.select("#datatable tbody tr").append("td")
    .attr("id","chartrow1")
    .attr("width",width + "px")
    .attr("rowspan",1)

  var chart1 = d3.select("#chartrow1").append("svg")
      .attr("class","chart")
      .attr("width",width)
      .attr("height",height);

  var maxDaily1 = d3.max(numprice1);
      minDaily1 = d3.min(numprice1);
      maxFix1 = maxDaily1.toFixed(2);
      minFix1 = minDaily1.toFixed(2);
      minmax1 = [minFix1, maxFix1];

  var xscale1 = d3.scaleLinear()
      .domain([0, numprice1.length - 1])
      .range([2*mx+5, width -  2*mx]);

  var yscale1 = d3.scaleLinear()
      .domain([minDaily1, maxDaily1])
      .range([7, height-7]);

 chart1.selectAll(".xaxislabel")
      .data(minmax1)
      .enter().append("text")
      .attr("class", "xaxislabel")
      .attr("x", mx)
      .attr("y",function(d) { return height - yscale1(d); })
      .attr("text-anchor", "middle")
      .style("font-size","7px")
      .text(String)

  chart1.selectAll(".xaxistick")
      .data(minmax1)
      .enter().append("line")
      .attr("x1", 2*mx + 5  )
      .attr("x2", width - 2*mx)
      .attr("y1", function(d) { return height - yscale1(d); })
      .attr("y2", function(d) { return height - yscale1(d); })
      .attr("stroke", "rgb(192,192,192)")
      .attr("stroke-width", 1)
      .attr('stroke-dasharray', '3 3');

  var line = d3.line()
                .x(function(d,i){ return xscale1(i); })
                .y(function(d,i){ return height - yscale1(d); })
                .curve(d3.curveLinear);

  chart1.append("path").attr("d",line(numprice1))
                    .attr("fill","none")
                    .attr("stroke","grey");

  chart1.append("rect")
       .attr("id", "overlay1")
       .attr("width", width - 2*mx)
       .attr("height", height)
       .attr("opacity",0)
       .on("mouseover", function() { focus.style("display", null); })
       .on("mouseout", function() { focus.style("display", "none"); })
       .on("mousemove", mousemove1);

  var focus = chart1.append("g")
                   .attr("class", "focus")
                   .style("display", "none");

  focus.append("circle")
       .attr("r", 2);

  focus.append("text")
       .attr("x", 2)
       .attr("dy", ".35em")
       .style("font-size","7px");

  var bisect = d3.bisector( function(d) { return d; }).left;

  function mousemove1() {
    var xIdx = xscale1.invert(d3.mouse(this)[0]),
        i = bisect(index, xIdx);
        if (i == 0) {
          d = index[0];
        }
        if ( i > 0) {
          d0 = index[i - 1],
          d1 = index[i],
          d = xIdx - d0 > d1 - xIdx ? d1 : d0;
        }
    focus.attr("transform", "translate(" + xscale1(d) + "," + (height - yscale1(numprice1[d])) + ")");
    focus.select("text").text(numprice1[d]);
      };

  ////===========ROW 2===============
  var tr2 = d3.select("#datatable tbody").append("tr")
    .attr("id","chart2")

  var td = tr2.selectAll("td")
              .data(combined2)
              .enter().append("td")
              .text(function(d) { return d; });

  d3.select("#datatable tbody #chart2").append("td")
    .attr("id","chartrow2")
    .attr("width",width + "px")
    .attr("rowspan",1)

  var chart2 = d3.select("#chartrow2").append("svg")
      .attr("class","chart")
      .attr("width",width)
      .attr("height",height);

  var maxDaily2 = d3.max(numprice2);
      minDaily2 = d3.min(numprice2);
      maxFix2 = maxDaily2.toFixed(2);
      minFix2 = minDaily2.toFixed(2);
      minmax2 = [minFix2, maxFix2];

  var xscale2 = d3.scaleLinear()
      .domain([0, numprice2.length - 1])
      .range([2*mx+5, width - 2*mx]);

  var yscale2 = d3.scaleLinear()
      .domain([minDaily2, maxDaily2])
      .range([7, height-7]);

  chart2.selectAll(".xaxislabel")
       .data(minmax2)
       .enter().append("text")
       .attr("class", "xaxislabel")
       .attr("x", mx)
       .attr("y",function(d) { return height - yscale2(d); })
       .attr("text-anchor", "middle")
       .style("font-size","7px")
       .text(String)

   chart2.selectAll(".xaxistick")
       .data(minmax2)
       .enter().append("line")
       .attr("x1", 2*mx + 5  )
       .attr("x2", width - 2*mx)
       .attr("y1", function(d) { return height - yscale2(d); })
       .attr("y2", function(d) { return height - yscale2(d); })
       .attr("stroke", "rgb(192,192,192)")
       .attr("stroke-width", 1)
       .attr('stroke-dasharray', '3 3');

  var line2 = d3.line()
                .x(function(d,i){ return xscale2(i); })
                .y(function(d,i){ return height - yscale2(d); })
                .curve(d3.curveLinear);

  chart2.append("path").attr("d",line2(numprice2))
                    .attr("fill","none")
                    .attr("stroke","grey");

  chart2.append("rect")
       .attr("id", "overlay2")
       .attr("width", width - 2*mx)
       .attr("height", height)
       .attr("opacity",0)
       .on("mouseover", function() { focus2.style("display", null); })
       .on("mouseout", function() { focus2.style("display", "none"); })
       .on("mousemove", mousemove2);

  var focus2 = chart2.append("g")
                   .attr("class", "focus")
                   .style("display", "none");

  focus2.append("circle")
       .attr("r", 2);

  focus2.append("text")
       .attr("x", 2)
       .attr("dy", ".35em")
       .style("font-size","7px");

  function mousemove2() {
    var xIdx = xscale2.invert(d3.mouse(this)[0]),
        i = bisect(index, xIdx);
        if (i == 0) {
          d = index[0];
        }
        if ( i > 0) {
          d0 = index[i - 1],
          d1 = index[i],
          d = xIdx - d0 > d1 - xIdx ? d1 : d0;
        }
        //console.log(yscale1(50));
    focus2.attr("transform", "translate(" + xscale2(d) + "," + (height - yscale2(numprice2[d])) + ")");
    focus2.select("text").text(numprice2[d]);
      };


  ////===========ROW 3===============
  var tr3 = d3.select("#datatable tbody").append("tr")
    .attr("id","chart3")

  var td = tr3.selectAll("td")
              .data(combined3)
              .enter().append("td")
              .text(function(d) { return d; });

  d3.select("#datatable tbody #chart3").append("td")
    .attr("id","chartrow3")
    .attr("width",width + "px")
    .attr("rowspan",1)

  var chart3 = d3.select("#chartrow3").append("svg")
      .attr("class","chart")
      .attr("width",width)
      .attr("height",height);

  var maxDaily3 = d3.max(numprice3);
      minDaily3 = d3.min(numprice3);
      maxFix3 = maxDaily3.toFixed(2);
      minFix3 = minDaily3.toFixed(2);
      minmax3 = [minFix3, maxFix3];

  var xscale3 = d3.scaleLinear()
      .domain([0, numprice3.length - 1])
      .range([2*mx+5, width-2*mx]);

  var yscale3 = d3.scaleLinear()
      .domain([minDaily3, maxDaily3])
      .range([7, height-7]);

  chart3.selectAll(".xaxislabel")
      .data(minmax3)
      .enter().append("text")
      .attr("class", "xaxislabel")
      .attr("x", mx)
      .attr("y",function(d) { return height - yscale3(d); })
      .attr("text-anchor", "middle")
      .style("font-size","7px")
      .text(String)

  chart3.selectAll(".xaxistick")
      .data(minmax3)
      .enter().append("line")
      .attr("x1", 2*mx + 5)
      .attr("x2", width-2*mx)
      .attr("y1", function(d) { return height - yscale3(d); })
      .attr("y2", function(d) { return height - yscale3(d); })
      .attr("stroke", "rgb(192,192,192)")
      .attr("stroke-width", 1)
      .attr('stroke-dasharray', '3 3');

  var line3 = d3.line()
                .x(function(d,i){ return xscale3(i); })
                .y(function(d,i){ return height - yscale3(d); })
                .curve(d3.curveLinear);

  chart3.append("path").attr("d",line3(numprice3))
                    .attr("fill","none")
                    .attr("stroke","grey");

  chart3.append("rect")
       .attr("id", "overlay3")
       .attr("width", width - 2*mx)
       .attr("height", height)
       .attr("opacity",0)
       .on("mouseover", function() { focus3.style("display", null); })
       .on("mouseout", function() { focus3.style("display", "none"); })
       .on("mousemove", mousemove3);

  var focus3 = chart3.append("g")
                   .attr("class", "focus")
                   .style("display", "none");

  focus3.append("circle")
       .attr("r", 2);

  focus3.append("text")
       .attr("x", 2)
       .attr("dy", ".35em")
       .style("font-size","7px");

  function mousemove3() {
    var xIdx = xscale3.invert(d3.mouse(this)[0]),
        i = bisect(index, xIdx);
        if (i == 0) {
          d = index[0];
        }
        if ( i > 0) {
          d0 = index[i - 1],
          d1 = index[i],
          d = xIdx - d0 > d1 - xIdx ? d1 : d0;
        }
    focus3.attr("transform", "translate(" + xscale3(d) + "," + (height - yscale3(numprice3[d])) + ")");
    focus3.select("text").text(numprice3[d]);
      };

}
