
# 利用UBUNTU14.04 编译和开发IEC62541 客户端和服务端 #
当你从事工业方面的通信和数据连接工作时，很高概率这样的点位地址会撞入你的眼睛"ns=0;i=86"，这样的利用ns和节点类型指示的地址就是OPC-UA协议。这个协议可以从github clone，从事工业、能源、电力和自动化行业的同仁应该有熟悉的。Mindsphere 云操作系统曾经提供过OPC UA pub/sub，利用MQTT 通道承载。SIMOCODE 马达管理器的ProfiNET 版本通过现场配置可以支持加密和不加密的OPC-UA。由于支持tls 鉴权和加密，62541 也是IoT 网关和云数据Hub 对接时可能支持的协议，研究一下很有必要。再说可以用于定制化项目的软网关的Server设计实现可以扩大数据的能见度。我的想法是，这么复杂的系统有什么能借鉴的呢？跨平台编译？cmake？代码架构？discovery？现场组态和发现，数据共享，可视化？

## 搭建环境 ##
按照[官方文档](http://www.open62541.org/doc/open62541-1.3.pdf) 的步骤不难编译出open62541.c 和open62541.h，如果把编译目标设定为AMALGAMATION 融合成文件，自己开发的server 和 client 代码就能引用。刚开始我想研究它的签名证书和加密通信，例如Basic256Sha256 endpoint 的建立。纸上得来终觉浅绝知此事要躬行，刚好我选择了Ubuntu14.04 Server搭建了一个虚机，放在我的Windows10 电脑里进行交叉开发- 利用notepad++ 修改代码winscp 放到Linux 硬盘里，再putty ssh 登陆上去开发编译运行。

## 编译 ## 
有一篇网文说这个库的编译目标除了上述最稳的融合文件编译结果，还能编译.a 静态库。 但是，在引用我编译的结果的时候从来没有正确过，ldd 报unreference token 例如UA 开头的函数和变量类型。nm -g 去查看也得到的是一堆gnu 入口点。先下载依赖库例如mbedtls 2.16 ，编译和安装。查看确认。再修改open62541根目录 CMakeList.txt 指明融合文件方式、加密编译模式、加密模块选择mbedtls；再，cmake 参数设定目标链接的mbedtls 的库目录和头文件目录。通常有两种方式一个是在./tools/cmake/ 下的FindMbedtls.cmake 配置里提供，另外一种在cmake 的命令参数里贴进去。

## 开发 ##
降低不确定性，我们在这个基础上做一个自签名和加密的通道的OPC-UA。网名叫做[爱就是恒久忍耐](https://wanghao1314.blog.csdn.net/?type=blog) ，他的文章才让我一步步了解了这个实现。这位作者的恒久细致的工作让我惊叹。对于62541 协议栈他写了70几篇了，就在短短这么一两年，在封城的shanghai。我工作太浮躁不能静下心来看官网的example code所以并不懂server 代码实现，看了他的代码得到了。
```

int main(int argc, char* argv[]) {
    signal(SIGINT, stopHandler);
    signal(SIGTERM, stopHandler);

    if(argc < 3) {
        UA_LOG_FATAL(UA_Log_Stdout, UA_LOGCATEGORY_USERLAND,
                     "Missing arguments. Arguments are "
                     "<server-certificate.der> <private-key.der> "
                     "[<trustlist1.der>, ...]");
        return EXIT_FAILURE;
    }

    /* Load certificate and private key */
    UA_ByteString certificate = loadFile(argv[1]);
    UA_ByteString privateKey  = loadFile(argv[2]);

    /* Load the trustlist */
    size_t trustListSize = 0;
    if(argc > 3)
        trustListSize = (size_t)argc-3;
    UA_STACKARRAY(UA_ByteString, trustList, trustListSize);
    for(size_t i = 0; i < trustListSize; i++)
        trustList[i] = loadFile(argv[i+3]);

    /* Loading of a issuer list, not used in this application */
    size_t issuerListSize = 0;
    UA_ByteString *issuerList = NULL;

    /* Loading of a revocation list currently unsupported */
    UA_ByteString *revocationList = NULL;
    size_t revocationListSize = 0;

    UA_Server *server = UA_Server_new();
    UA_ServerConfig *config = UA_Server_getConfig(server);

    UA_StatusCode retval =
        UA_ServerConfig_setDefaultWithSecurityPolicies(config, 4840,
                                                       &certificate, &privateKey,
                                                       trustList, trustListSize,
                                                       issuerList, issuerListSize,
                                                       revocationList, revocationListSize);
      
    // 填坑的地方，非常重要
    UA_String_deleteMembers(&config->applicationDescription.applicationUri);                                                  
    config->applicationDescription.applicationUri = UA_STRING_ALLOC("10.0.0.29");
    for (size_t i = 0; i < config->endpointsSize; ++i)
    {
        UA_String_deleteMembers(&config->endpoints[i].server.applicationUri);
        config->endpoints[i].server.applicationUri = UA_String_fromChars("10.0.0.29");
    }
    
    UA_ByteString_clear(&certificate);
    UA_ByteString_clear(&privateKey);
    for(size_t i = 0; i < trustListSize; i++)
        UA_ByteString_clear(&trustList[i]);
    if(retval != UA_STATUSCODE_GOOD)
        goto cleanup;

	/* Insert Enum */
    UA_StatusCode ret = addMyEnumDataType(server);
    if (UA_StatusCode_isGood(ret)) {
        UA_NodeId myEnumVarTypeId;
        ret = addMyEnumVariableType(server, myEnumVarTypeId);
        if (UA_StatusCode_isGood(ret)) {
            ret = addMyEnumVariable(server, myEnumVarTypeId);
        }
    }
    if (UA_StatusCode_isBad(ret)) {
        printf("Error\n");
        UA_Server_delete(server);
        return 0;
    }
	/* Insert Enum */

	/*Insert 2 Cyclic to server space*/ 
    UA_NodeId targetNodeId = addTheAnswerVariable(server);
    UA_NodeId target2NodeId = addTheAnswer2Variable(server);

    UA_NodeId idArr[2] = {targetNodeId, target2NodeId};

    UA_UInt64 callbackId = 0;
	UA_Server_addRepeatedCallback(server, cycleCallback, idArr, 1000, &callbackId); // call every 1s
	/*Insert 2 Cyclic to server space*/ 
    

	// delete & update server name
	UA_LocalizedText_deleteMembers(&config->applicationDescription.applicationName);
	const char * OPCUA_SERVER_NAME = "SampleOPCUAServer";
	config->applicationDescription.applicationName = UA_LOCALIZEDTEXT_ALLOC("en", OPCUA_SERVER_NAME);	
	// modify endpoint name
	for (size_t i = 0; i < config->endpointsSize; ++i)
	{
        UA_LocalizedText * ptr = &config->endpoints[i].server.applicationName;
        UA_LocalizedText_deleteMembers(ptr);
        (*ptr) = UA_LOCALIZEDTEXT_ALLOC("en", OPCUA_SERVER_NAME);
    }
	// delete & update server name

    retval = UA_Server_run(server, &running);

 cleanup:
    UA_Server_delete(server);
    return retval == UA_STATUSCODE_GOOD ? EXIT_SUCCESS : EXIT_FAILURE;
}
```
这段服务器代码提供了发布周期变量的功能，通过certificate 和privateKey 引入签名鉴权和数据加密。targetNodeId = addTheAnswerVariable 插入变量，使服务器可发布数据。这段代码还包括发布带说明字符串的枚举变量，修改服务器的名称。

## 如何系统发布数据 ##
这块总是要解决的，刚开始可以通过一个静态文件的形式来插入发布数据matrix - 包括.description，.displayName,.dataType, .typeId, attr.accessLevel；
但是这些数据不能变化，如果想dynamic 动起来我能想到的一个办法是链接到硬件变化。 例如传感器温湿度CO2 PM2.5等输入变量，抑或DIO 输入，抑或协议表计的读入值。再集中一点咱们还是用数据库来描述数据matrix。利用一个程序监视专门的写数据库来更新这个数据表。轻量级的一个变化就是监视localhost MQTT 某个topic来获取外部数据的元数据和增量。

