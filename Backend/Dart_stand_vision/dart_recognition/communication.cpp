#include <curl/curl.h>
#include <nlohmann/json.hpp> // 需要包含nlohmann/json库

// 发送回调函数
size_t writeCallback(void* contents, size_t size, size_t nmemb, void* userp) {
    return size * nmemb;
}

// 用于接收从后端返回的图像数据
size_t writeImageCallback(void* contents, size_t size, size_t nmemb, void* userp) {
    vector<uchar>* imageData = static_cast<vector<uchar>*>(userp);
    size_t totalSize = size * nmemb;
    imageData->insert(imageData->end(), (uchar*)contents, (uchar*)contents + totalSize);
    return totalSize;
}

// 用于发送帧到后端
void sendFrameToBackend(Mat& frame, vector<uchar>& receivedImageData, const vector<mCircle>& detectedCircles) {
    CURL* curl;
    CURLcode res;
    string url = "http://localhost:3000/standCamera"; // Node.js 后端的URL

    // 将Mat转换为JPEG格式
    vector<uchar> buffer;
    imencode(".jpg", frame, buffer);

    // 打印图像数据大小
    //cout << "Sending frame with size: " << buffer.size() << " bytes" << endl;

    // 创建CURL对象
    curl_global_init(CURL_GLOBAL_DEFAULT);
    curl = curl_easy_init();
    if(curl) {
        // 构建multipart请求
        struct curl_httppost* form = NULL;
        struct curl_httppost* lastptr = NULL;

        // 将图像数据作为文件上传
        curl_formadd(&form, &lastptr,
                     CURLFORM_COPYNAME, "image",
                     CURLFORM_BUFFER, "frame.jpg",
                     CURLFORM_BUFFERPTR, buffer.data(),
                     CURLFORM_BUFFERLENGTH, buffer.size(),
                     CURLFORM_END);

        // 将圆的半径和中心坐标作为JSON数据上传
        nlohmann::json circlesJson;
        for (const auto& circle : detectedCircles) {
            circlesJson.push_back({
                                          {"center", {circle.center.x, circle.center.y}},
                                          {"radius", circle.r}
                                  });
        }
        string circlesData = circlesJson.dump();
        curl_formadd(&form, &lastptr,
                     CURLFORM_COPYNAME, "circles",
                     CURLFORM_COPYCONTENTS, circlesData.c_str(),
                     CURLFORM_CONTENTSLENGTH, circlesData.size(),
                     CURLFORM_END);

        // 设置CURL选项
        curl_easy_setopt(curl, CURLOPT_URL, url.c_str());
        curl_easy_setopt(curl, CURLOPT_HTTPPOST, form);
        curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, writeImageCallback);
        curl_easy_setopt(curl, CURLOPT_WRITEDATA, &receivedImageData);  // 存储接收到的图像数据

        // 执行请求
        res = curl_easy_perform(curl);
        if(res != CURLE_OK) {
            cerr << "curl_easy_perform() failed: " << curl_easy_strerror(res) << endl;
        }

        // 清理
        curl_easy_cleanup(curl);
    }
    curl_global_cleanup();
}

//main里面的调用

// 用于存储从后端返回的图像数据
vector<uchar> receivedImageData;

// 将处理后的图像发送到后端并接收返回的图像数据，只发送过滤后的圆形
sendFrameToBackend(rawDisplay, receivedImageData, filteredCircles);