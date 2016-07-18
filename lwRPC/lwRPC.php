<?php
class LwRPC {

	$registerFunc = array();



	function __construct() {
		ob_start();
	}


	/*
		判断函数是否注册
	*/
	function isRegister($funcname) {

	}

	/*
		获取JS客户端的Ajax参数
		用引用传入函数名和参数来返回多个
		从_POST获取函数信息
	*/
	function getRequest(&$funcname, &$parameter) {

	}



}



?>