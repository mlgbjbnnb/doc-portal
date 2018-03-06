export function convertToUnFlattenJson(flattenJson) {

    const platform_products = ['sdk_ios_voice', 'sdk_android_voice', 'sdk_ios_video', 'sdk_android_video',
        'sdk_windows_video', 'sdk_web_plugin_video', 'sdk_web_video', 'sdk_macos_video', 'sdk_ios_amg', 'sdk_android_amg',
        'sdk_cocos2d_amg', 'sdk_unity3d_amg', 'sdk_unityVideo_amg', 'sdk_linux_recording', 'product_whiteboard_allplatform', 'product_imageenhancement_ios',
        'product_imageenhancement_android', 'product_signaling_ios','product_signaling_android', 'product_signaling_macos',
        'product_signaling_windows', 'product_signaling_Java'
    ];

    let unFlattenedJson = [];
    let productList = [];
    Object.keys(flattenJson.data).map((key) => {
        if(/^product_type/.test(key)) {
            let product = /product_type_(.*)_sdk/.exec(key)[1];
            if (product === 'gaming') {
                product = 'amg';
            }
            if (product === 'image_enhancement') {
                product = 'imageenhancement';
            }
            productList.push({
                productName: product,
                title: flattenJson.data[key]
            });
        }
    });

    productList.map((product) => {
        let productItem = {};
        productItem.title = product.title;
        productItem.platforms = [];
        platform_products.map((platform) => {
            let platformObj = {};
            let re = new RegExp(product.productName);
            let matchProduct = re.test(platform);
            if(matchProduct) {
                platformObj.downloadUrl = flattenJson.data[platform];
                let childFields = Object.keys(flattenJson.data).filter((item) => {
                    let reg = new RegExp(platform+'.');
                    return reg.test(item);
                });
                childFields.map((childField) => {
                    let childKey = childField.split('.')[1];
                    platformObj[childKey] = flattenJson.data[childField];
                });
                productItem.platforms.push(platformObj);
            }
        });
        unFlattenedJson.push(productItem);
    });

    return unFlattenedJson;

}