var o = new Object()
var o = new Object //如果没有参数，就可以不带()

//Object 对象
//Object对象自身用处不大，不过在了解其他类之前，还是应该了解它。因为ECMAScript中的Object对象与Java中的java.lang.Object相似，ECMAScript中的所有对象都由这个对象继承而来，Object对象中的所有属性和方法都会出现在其他对象中，所以理解了Object对象，就可以更好地理解其他对象。
//
//Object 对象具有下列属性：
//constructor
//对创建对象的函数的引用（指针）。对于Object对象，该指针指向原始的Object()函数。
//Prototype
//对该对象的对象原型的引用。对于所有的对象，它默认返回Object对象的一个实例。
//Object 对象还具有几个方法：
//hasOwnProperty(property)
//判断对象是否有某个特定的属性。必须用字符串指定该属性。（例如，o.hasOwnProperty("name")）
//IsPrototypeOf(object)
//判断该对象是否为另一个对象的原型。
//PropertyIsEnumerable
//判断给定的属性是否可以用for...in语句进行枚举。
//ToString()
//返回对象的原始字符串表示。对于Object对象，ECMA-262没有定义这个值，所以不同的ECMAScript实现具有不同的值。
//ValueOf()
//返回最适合该对象的原始值。对于许多对象，该方法返回的值都与ToString()的返回值相同。


//number 对象
var num = new number(45);

//toFixed()方法返回的是具有指定位数小数的数字的字符串表示  toFixed() 方法能表示具有0到20位小数的数字，超过这个范围的值会引发错误。
var num1 = num.tofixed(2)

//toExponential(),返回的是用科学计数法表示的数字的字符串形式。
alert(num.toExponential(1));  //输出 "4.5e+1"

//toPrecision() 方法
alert(num.toPrecision(1));  //输出 "5e+1"  //4舍5进
alert(num.toPrecision(2));  //输出 "45"
alert(num.toPrecision(3));  //输出 "45.0"


//String 对象
var ii = new String('lylyl')  //*String对象的所有属性和方法都可应用于String原始值上，因为它们是伪对象
console.log(ii.length)
console.log(ii.charAt(2))      //访问指定位置单个字符
console.log(ii.charCodeAt(2))  //字符代码

//indexOf()和lastIndexOf()方法返回的都是指定的子串在另一个字符串中的位置，如果没有找不到子串，则返回-1。
ii.indexOf(l)
ii.lastIndexOf(y)



//localeCompare() 方法
//ocaleCompare()，对字符串进行排序。该方法有一个参数 - 要进行比较的字符串，返回的是下列三个值之一：
//如果String对象按照字母顺序排在参数中的字符串之前，返回负数。
//如果String对象等于参数中的字符串，返回0
//如果String对象按照字母顺序排在参数中的字符串之后，返回正数。


//concat()方法，用于把一个或多个字符串连接到String对象的原始值上。该方法返回的是String原始值，保持原始的String对象不变
var jj = ii.concat('world')


//截取字符串
ii.slice(-1)
ii.substring(-3,5)


//大小写转换
ii.toLowerCase()
ii.toLocaleLowerCase()
ii.toUpperCase()
ii.toLocaleUpperCase()







