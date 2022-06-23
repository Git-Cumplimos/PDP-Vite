import { Bar } from "react-chartjs-2";

import classes from "./Chart.module.css";
// import "react-chartjs-2/dist/"

const Chart = ({
  dataSets,
  title = "",
  xTitle = "",
  yTitle = "",
  fontStyle: { fontSize, fontColor, fontFamily } = {
    fontSize: 14,
    fontColor: "#000000",
    fontFamily: "Arial",
  },
  clickEvent,
}) => {
  const { graphDiv } = classes; 
  const fontObj = {
    color: fontColor,
    font: {
      size: fontSize,
      family: fontFamily,
    },
  };
  
  return (
    <div>
      <div className={graphDiv}>
        <Bar
          data={{
            datasets: dataSets,
          }}
          options={{
            // maintainAspectRatio: false,
            scales: {
              y: {
                grid: {
                  color: fontColor,
                },
                ticks: {
                  ...fontObj,
                },
                title: {
                  display: yTitle !== "",
                  text: yTitle,
                  ...fontObj,
                  padding: {
                    bottom: 10,
                  },
                },
              },
              x: {
                grid: {
                  color: fontColor,
                },
                ticks: {
                  ...fontObj,
                },
                title: {
                  display: xTitle !== "",
                  text: xTitle,
                  ...fontObj,
                  padding: {
                    top: 10,
                  },
                },
              },
            },
            plugins: {
              legend: {
                labels: {
                  ...fontObj,
                },
              },
              title: {
                display: title !== "",
                text: title,
                ...fontObj,
              },
            },
          }}
          getElementAtEvent={clickEvent}
        />
      </div>
    </div>
  );
};

export default Chart;
