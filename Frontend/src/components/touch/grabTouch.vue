<template>
  <canvas
      ref="drawCanvas"
      :width="width"
      :height="height"
      @touchmove="handleTouchMove"
  ></canvas>
  <div class = "value-display">X坐标: <span>{{ dart.x }}</span> mm</div>
  <div class = "value-display">Y坐标: <span>{{ dart.y }}</span> mm</div>
</template>

<script>
import { ref, onMounted, watch } from "vue";
import { useRouter } from "vue-router"; // 引入 useRouter

export default {
  name: "grabTouch",
  props: {
    width: {
      type: Number,
      default: 660, // 默认宽度
    },
    height: {
      type: Number,
      default: 374, // 默认高度
    },
  },
  setup(props) {
    const drawCanvas = ref(null); // canvas 的引用
    const origin = ref({
      x: props.width / 2,
      y: props.height / 2,
    }); // 坐标系中心
    const dart = ref({x: "-", y: "-"});//飞镖落点坐标（实际）
    const router = useRouter(); // 获取路由实例

    // 触摸移动事件
    const handleTouchMove = async(event) => {
      const touch = event.touches[0]; // 获取第一个触控点

      if(touch){
        // 转换触控点到画布坐标
        const touchX = touch.clientX / 1702 * props.width;
        const touchY = (touch.clientY + 74) / 1066 * props.height;//根据实际触摸屏得到的，画布canvas的坐标


        dart.value.x = ((touch.clientX / 1702 - 0.5 ) * 600).toFixed(2);//实际的坐标值
        dart.value.y = (((0.5 - (touch.clientY + 74) / 1066) * 340)).toFixed(2);

        // dart.value.x = ((touchX / props.width * 600) ).toFixed(2);
        // dart.value.y = ((touchY / props.height * 340)).toFixed(2);

        // 在触控点绘制红点
        const ctx = drawCanvas.value.getContext("2d");
        ctx.fillStyle = "red";
        ctx.beginPath();
        ctx.arc(touchX, touchY, 5, 0, Math.PI * 2); // 小圆点
        ctx.fill();

        const data = {
          dartX_value: dart.value.x,
          dartY_value: dart.value.y,
        }
        console.log(data); // 打印发送的数据
        try {
          await fetch("http://localhost:3000/touch/writeToTouch", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          });
        } catch (error) {
          console.error("Error sending data:", error);
        }
        router.push("/"); // 跳转到 Home 页面

        // // 延迟2秒后跳转回Home界面
        // setTimeout(() => {
        //   router.push("/"); // 跳转到 Home 页面
        // }, 2000);
      }

    };

    // 绘制网格
    const drawGrid = () => {
      const canvas = drawCanvas.value;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      const { width, height } = props;
      const {x: originX, y: originY} = origin.value;

      ctx.clearRect(0, 0, width, height);

      // 画背景网格线
      ctx.strokeStyle = "#f6d5d5";
      ctx.lineWidth = 1;
      //其中11是660 * 374 的公因数
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
      ctx.strokeStyle = "#eaa2a9";
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
      ctx.fillStyle = "#eaa2a9";
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
        if(scaleY !== 0)//让坐标轴上只有一个0
          ctx.fillText(scaleY, originX + 2, y - 2); // y轴刻度
        scaleY = scaleY - 40;
      }
    };

    //阻止页面的触摸滚动
    const disablePageScroll = (event) => {
      event.preventDefault();
    };

    // 在组件挂载后绘制网格
    onMounted(() => {
      drawGrid();
      // 阻止页面的触摸滚动
      document.addEventListener("touchmove", disablePageScroll, { passive: false });
    });

    // 当宽度或高度发生变化时重新绘制网格
    watch([() => props.width, () => props.height], drawGrid);

    return {
      drawCanvas,
      handleTouchMove,
      dart,
    };
  },
};
</script>

<style scoped>
canvas {
  border: 1px solid #a65858;
  display: block;
  margin-left: 23px;
}
</style>
