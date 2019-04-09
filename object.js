//对象

//一般写法
let obj = new Object()
obj.val = 5
obj.click = function(){
    console.log(obj.val)
}
obj.click()

//
let obj = {
    val: 5,
    click: function(){
        console.log(obj.val)
    }
}
obj.click()

//增强对象写法

let obj = {
    val: 5,
    click(){
    console.log(obj.val)
    }
}
obj.click()
