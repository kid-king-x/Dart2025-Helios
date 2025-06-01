<template>
  <div class="locationDisplay">
    <canvas
        ref="drawCanvas"
        :width="width"
        :height="height"
    ></canvas>
  </div>

  <div class="dataDisplay">
    <table>
      <tbody>
        <tr>
          <td>X坐标:</td><td>{{ dart.x }}</td>
          <td>Y坐标:</td><td>{{ dart.y }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import { ref, onMounted, watch } from "vue";

export default {
  name: "displayTouch",
  props: {
    width: {
      type: Number,
      default: 600, // 默认宽度
    },
    height: {
      type: Number,
      default: 340, // 默认高度
    },
  },
  setup(props) {
    const drawCanvas = ref(null); // canvas 的引用
    const origin = ref({
      x: props.width / 2,
      y: props.height / 2,
    }); // 坐标系中心
    const dart = ref({x: "-", y: "-"});//飞镖落点坐标（实际）

    //读取飞镖落点坐标
    const fetchTouch = async() => {
      try {
        const response = await fetch("http://localhost:3000/touch/readTouch");
        const data = await response.json();
        //data.dart = undefined;暂时不确定要不要加

        dart.value = {
          x: data.dart[0],
          y: data.dart[1],
        }
        return data; // 返回旧数据供后续操作使用
      } catch (error) {
        console.error("Error fetching dart touch:", error);
        return null;
      }
    }

    // 绘制网格
    const drawGrid = () => {
      const canvas = drawCanvas.value;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      const { width, height } = props;
      const {x: originX, y: originY} = origin.value;

      const Dart = dart.value;
      const touchX = (Dart.x / 600 + 0.5) * width;// 飞镖落点的画布坐标，在grabTouch那边处理得到的是实际的落点，所以需要修改
      const touchY = (0.5 - Dart.y / 340) * height;

      ctx.clearRect(0, 0, width, height);

      // 画背景网格线
      ctx.strokeStyle = "#b9e8a6";
      ctx.lineWidth = 1;

      for (let x = (width / 30); x <= width; x += (width / 15)) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = (width / 60); y <= height; y += (width / 15)) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // 绘制坐标轴
      ctx.strokeStyle = "#97c977";
      ctx.lineWidth = 2;

      // x轴
      ctx.beginPath();
      ctx.moveTo(0, originY);
      ctx.lineTo(width, originY);
      ctx.stroke();

      // y轴
      ctx.beginPath();
      ctx.moveTo(originX, 0);
      ctx.lineTo(originX, height);
      ctx.stroke();

      // 添加刻度
      ctx.fillStyle = "#8abd67";
      ctx.font = "12px Arial";
      let scaleX = - 280;
      let scaleY = 160;
      for (let x = (width / 30); x <= width; x += (width / 15)) {

        /* x轴刻度
        * ctx.fillText(text, x, y)
        * text为要绘制的文本内容，x为文本起始x坐标，y为文本起始y坐标
        * */
        ctx.fillText(scaleX, x, originY - 2); // x轴刻度
        scaleX = scaleX + 40;
      }
      for (let y = (width / 60); y <= height; y += (width / 15)) {
        if(y !== 187)//让坐标轴上只有一个0
          ctx.fillText(scaleY, originX + 2, y - 2); // y轴刻度
        scaleY = scaleY - 40;
      }

      // 绘制落点
      ctx.fillStyle = "red";
      ctx.beginPath();
      ctx.arc((touchX ), (touchY), 5, 0, Math.PI * 2); // 小圆点
      ctx.fill();
    };

    //阻止页面的触摸滚动
    const disablePageScroll = (event) => {
      event.preventDefault();
    };

    // 在组件挂载后绘制网格
    onMounted(async() => {
      await fetchTouch(); // 获取X落点，Y落点
      drawGrid();
      // 阻止页面的触摸滚动
      document.addEventListener("touchmove", disablePageScroll, { passive: false });
    });

    // 当宽度或高度发生变化时重新绘制网格
    watch([() => props.width, () => props.height], drawGrid);

    return {
      drawCanvas,
      dart,
    };
  },
};
</script>

<style scoped>
canvas {
  flex: 3;
  border: 1px solid #8abd67;
  display: block;
  margin-left: 3px;
  margin-top: 3px;
}
table {
  flex: 1;
  border: 1px solid #4a6c42;
  border-collapse: collapse;
  width: 662px;
  margin-left: 3px;
  text-align: left; /* 设置表格文本左对齐 */
  background-color: #ebf5e6;
}
tr, td {
  border: 1px solid #ccc;
  padding: 3px;
  text-align: center;
  width: 25%;
}
th {
  background-color:#b9e8a6;
}
</style>
