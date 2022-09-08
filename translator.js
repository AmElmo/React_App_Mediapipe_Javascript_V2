// import * as tf from "@tensorflow/tfjs"

const videoElement = document.getElementsByClassName('input_video')[0];
const canvasElement = document.getElementsByClassName('output_canvas')[0];
const canvasCtx = canvasElement.getContext('2d');

const list_poses = []

function onResults(results) {
  canvasCtx.save();
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  canvasCtx.drawImage(results.segmentationMask, 0, 0,
                      canvasElement.width, canvasElement.height);

  // Only overwrite existing pixels.
  // canvasCtx.globalCompositeOperation = 'source-in';
  canvasCtx.fillStyle = '#00FF00';
  canvasCtx.fillRect(0, 0, canvasElement.width, canvasElement.height);

  // Only overwrite missing pixels.
  // canvasCtx.globalCompositeOperation = 'destination-atop';
  canvasCtx.drawImage(
      results.image, 0, 0, canvasElement.width, canvasElement.height);

  // canvasCtx.globalCompositeOperation = 'source-over';
  drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS,
                 {color: '#00FF00', lineWidth: 4});
  drawLandmarks(canvasCtx, results.poseLandmarks,
                {color: '#FF0000', lineWidth: 2});


  const pose = []
  if (results.poseLandmarks) {
      results.poseLandmarks.forEach((res) => {
        pose.push(res.x, res.y, res.z, res.visibility)
      })
    } else {
      for (let i=0; i<132; ++i) pose[i] = 0;
    }
  if (results.faceLandmarks) {
      results.faceLandmarks.forEach((res) => {
        pose.push(res.x, res.y, res.z)
    })} else {
      for (let i=132; i<1536; ++i) pose[i] = 0;
    }
  if (results.leftHandLandmarks) {
        results.leftHandLandmarks.forEach((res) => {
          pose.push(res.x, res.y, res.z)
      })} else {
        for (let i=1536; i<1599; ++i) pose[i] = 0;
      }
  if (results.rightHandLandmarks) {
        results.rightHandLandmarks.forEach((res) => {
          pose.push(res.x, res.y, res.z)
      })} else {
        for (let i=1599; i<1662; ++i) pose[i] = 0;
      }

  console.log(pose)

  console.log(pose.length)

  list_poses.push(pose)

  if (list_poses.length = 30) {
    console.log(list_poses)

    const y = tf.tensor2d(list_poses);
    const axs = 0;
    const list_poses_3D = y.expandDims(axs)

    console.log(list_poses_3D)

    console.log("Pushing to model!!!")
    list_poses.length = 0
  }

  console.log(results.faceLandmarks)
  console.log(results.leftHandLandmarks)
  console.log(results.rightHandLandmarks)


  drawConnectors(canvasCtx, results.faceLandmarks, FACEMESH_TESSELATION,
                 {color: '#C0C0C070', lineWidth: 1});

  drawConnectors(canvasCtx, results.leftHandLandmarks, HAND_CONNECTIONS,
                 {color: '#CC0000', lineWidth: 5});
  drawLandmarks(canvasCtx, results.leftHandLandmarks,
                {color: '#00FF00', lineWidth: 2});
  console.log(results.leftHandLandmarks);
  drawConnectors(canvasCtx, results.rightHandLandmarks, HAND_CONNECTIONS,
                 {color: '#00CC00', lineWidth: 5});
  drawLandmarks(canvasCtx, results.rightHandLandmarks,
                {color: '#FF0000', lineWidth: 2});
  console.log(results.rightHandLandmarks);
  canvasCtx.restore();
}



const holistic = new Holistic({locateFile: (file) => {
  return `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}`;
}});
holistic.setOptions({
  modelComplexity: 1,
  smoothLandmarks: true,
  enableSegmentation: true,
  smoothSegmentation: true,
  refineFaceLandmarks: false,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5
});
holistic.onResults(onResults);

const camera = new Camera(videoElement, {
  onFrame: async () => {
    await holistic.send({image: videoElement});
  },
  width: 1280,
  height: 720
});
camera.start();
