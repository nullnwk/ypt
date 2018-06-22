
$(function(){

	//跳转变量
	var html=$('html'),
		linksBtn=$('.pageBtn'),
		navBar=$('#nav-bar'),
		navBack=$('a.nav-back',navBar),
		navBtn=$('a.nav-btn',navBar),
		pageTitle=$('.page-title',navBar),
		//弹框
		modalWarning=$('#modal-warning'),
		modalTitle=$('#modal-title'),
		modalBody=$('#modal-body'),
		//其他
		activeClass='site-page-active',
		duration=120,
		easing='swing',
		timer=null,
		chinaAreaData=null,
		userInfo,
		navArrs=[{
			name:$('.'+activeClass).attr('id'),
			hasBar:false,
			title:'',
			btns:null
		}],
		cardCookie,
		cardTypesArr,
		nowIP;

	var validateWrap=$('#validate-wrap'),
		validateTips=$('#validate-tips');

	/*========初始化=========*/
	//年份
	(function(){
		var now=new Date(),
			year=now.getFullYear(),
			html='';
		for(var i=1950;i<=year;i++){
			html+='<option value="'+i+'">'+i+'</option>';
		}
		$('#birth-y').html(html);
	})();
	//天数
	$('#birth-m').change(function(){
		var y=$('#birth-y').val(),
			m=$(this).val(),
			html='',
			days=(new Date(Number(y),Number(m),0)).getDate();

		for(var i=1;i<=days;i++){
			html+='<option value="'+i+'">'+i+'</option>';
		}
		$('#birth-d').html(html)
	});
	//获取用户信息
	function getUserInfo(callBack){
		loginTEST(function(data){
			userInfo=data;
			$('#user-login').removeClass('logOut').addClass('logIn')
			$('#user-login').prev().removeClass('logOutImg');
			// $('#user-birth').val(data.birth);
			var bArr=data.birth.split('-');
			$('#birth-y').val(bArr[0]);
			$('#birth-m').val(Number(bArr[1])).trigger('change');
			$('#birth-d').val(Number(bArr[2]));

			$('#user-name').val(data.name);
			$('.user-name-txt').html(data.name);
			$('.user-img img').attr('src',data.userHeadImage? domain+data.userHeadImage:'img/login_user.png')

			callBack && callBack();
		})
	}
	getUserInfo();
	getIp();
	//跳转个人信息
	$('#user-login').click(function(){
		if($(this).hasClass('logIn')){
			goToPage({
				name:'user-account',
				title:'账户设置',
				btns:null,
				hasBar:1
			})
		}else{
			location.href='html/login_m.html';
		}
	});
	//加载更多
	$(document).on('click','div.more-btn',function(){
		var _this=$(this),
			p=_this.parent(),
			pId=p.attr('id'),
			index,ele,
			noBefore;

		if(pId=='getPoints'||pId=='policy'||pId=='news'||pId=='notice'){
			index=$('tr',p).length-1;
			ele=$(this).prev();
			noBefore=1;
		}else{
			index=Number(_this.prev().attr('index'));
			ele=$(this).parent();
		}
		listRender(index,ele,noBefore);
		
	})

	/*========首页菜单========*/
	//首页顶部跳转
	$('#user-nav .pageBtn').click(function(e){
		e.preventDefault();
		e.stopPropagation();

		var href=$(this).attr('href');
		if(!href)return;
		var title=$('span',this).eq(1).html(),
			pageData={
				name:href,
				hasBar:1,
				title:title,
				btns:null
			};

		//积分
		if(href=='user-points'){
			goToPage(pageData,function(){
				canSign();
				pointsQuery();
			})
		}
		//订单
		else if(href=='user-orders'){
			pageData.title='我的订单';
			goToPage(pageData,function(){
				ordersQuery({
					t:'',
					state:$('#user-orders li.active').attr('type')
				})
			})
		}
		//次卡
		else if(href=="user-cards"){
			pageData.title="我的卡包";
			pageData.btns=[
				{text:'',icon:'ypt-icon ypt-icon-order1',action:'card-orders'},
				{text:'',icon:'ypt-icon ypt-icon-vipcard',action:'buy-card-form'},
				{text:'',icon:'ypt-icon ypt-icon-bind',action:'bind-card'}
			]
			goToPage(pageData,function(){
				cardsQuery();
			})
		}
		//地址
		else if(href=="user-address"){
			pageData.btns=[
				{text:'添加',icon:'',action:'add-address'}
			];
			goToPage(pageData,function(){
				queryAdrList();
			})

		}
		//评论
		else if(href=="user-comment"){
			goToPage(pageData,function(){
				getComments($('#user-comment li.active').attr('state'));
			})	
		}
		//收藏
		else if(href=="user-favour"){
			goToPage(pageData,function(){
				favourQuery($('#user-favour li.active').find('a').attr('type'))
			})
		}
		else if(href=='user-coupon'){
			goToPage(pageData)
		}
		else if(href=='user-msg'){
			goToPage(pageData)
		}
		//默认
		else{
			goToPage(pageData)
		}
	})

	//客服电话
	$('#callserve').click(function(){
		// modalTitle.attr('phone','1')
		modalTitle.html('客服电话');
		modalBody.html('是否确认呼叫客服？');
		modalWarning.modal('show');
	})
	//呼叫
	$('#callSubmit').click(function(){
		// $('#callservePhone').trigger('click');
		modalWarning.modal('hide');
	})


	/*========导航菜单=========*/
	//左上角返回
	navBack.click(function(){
		if(cardCookie){
			window.location.href='newIndex.html';
		}else{
			goBack(1)
		}
	})
	//右上角操作跳转
	navBar.on('click','a.nav-btn',function(){
		var action=$(this).attr('action'),
			pageData={
				name:action,
				hasBar:1,
				title:'',
				btns:null
			};

		if(!action)return;
		//购买次卡
		if(action=='buy-card-form'){
			pageData.title='选择次卡信息';
			$('#buy-card').trigger('click');
		}
		//绑定次卡
		else if(action=='bind-card'){
			pageData.title='绑定次卡';
			$('#bind-no').val('');
			$('#bind-pass').val('');
			goToPage(pageData);
		}
		//次卡订单
		else if(action=='card-orders'){
			pageData.title='订单详情';
			goToPage(pageData,function(){
				getCardOrders($('#card-orders li.active').attr('type'));
			});
		}
		//增加地址
		else if(action=='add-address'){
			pageData.title='增加地址';
			$('#adr-name').val('');
			$('#adr-phone').val('');
			$('#adr-detail').val('');
			$('#adr-state').prop('checked',false);
			$('#save-address').attr('action','add');
			goToPage(pageData,function(){
				getArea()
			})
		}
	})
	//成功页面返回首页
	$('.homeBack').click(function(){
		homeBack();
	})

	/*========我的积分=========*/
	//请求
	function pointsQuery(){
		loginTEST(function(){
			var params=$.extend({},publicParams,{
				url:domain+paths.points1,
				data:{ssid:ssid},
				success:function(data){
					data=$.parseJSON(data);
					console.dir(data);
					requestCallBack(data,function(){
						//总积分
						$('#integral').text(data.integral);
						insertPoints(data.list);
					})
				}
			})
			$.ajax(params);
		})
	}
	//填充
	function insertPoints(data){
		var len=data.length,
			wrap=$('#getPoints table');;

 		if(len){
			wrap.data('page',{
				data:data,
				numbersPerPage:5,
				getHtml:function(index,renderLen,data){
					var tpl,
						html='';
					for(var i=0;i<renderLen;i++){
						tpl=userTemplatesObj.points;
						$.each(data[index+i],function(k,v){
							tpl=tpl.replace('{'+k+'}',v)
						})
						html+=tpl
					}
					return html;
				}
			});
			listRender(0,wrap,1)
		}else{
			wrap.html(noDataStr)
		}
	}
	//检查是否可以签到
	function canSign(callBack){
		loginTEST(function(){
			var params=$.extend({},publicParams,{
				url:domain+paths.canSignPoints,
				data:{ssid:ssid},
				success:function(data){
					data=$.parseJSON(data);
					requestCallBack(data,function(){
						//签到
						callBack && callBack();
					},function(){
						$('#sign-points').html('已签到').addClass('hasSigned');
					})
					
				}
			})
			$.ajax(params);
		})
	}
	//签到
	$('#sign-points').click(function(){
		var signBtn=$(this);
		//检查是否可以签到
		if($(this).hasClass('hasSigned')){
			showTipsModal('今日已签到。')
			return;
		}
		canSign(function(){
			//签到
			loginTEST(function(){
				var params=$.extend({},publicParams,{
					url:domain+paths.signPoints,
					data:{ssid:ssid},
					success:function(data){
						data=$.parseJSON(data);
						console.dir(data);

						requestCallBack(data,function(){
							showTipsModal('签到成功！');
							signBtn.text('已签到').addClass('hasSigned');
							pointsQuery()
						})
					}
				})
				$.ajax(params);
			})	
		})
	})

	/*========我的次卡=========*/
	//请求
	function cardsQuery(){
		loginTEST(function(){
			var params=$.extend({},publicParams,{
				url:domain+paths.cardQuery,
				data:{ssid:ssid},
				success:function(data){
					data=$.parseJSON(data);
					console.dir(data);

					requestCallBack(data,function(){
						insertCards(data.data);
					})
					
				}
			})
			$.ajax(params);
		});
	}
	//填充
	function insertCards(data){
		var i=0,
			len=data.length,
			count1=0,count2=0,count3=0,
			data1=[],data2=[],data3=[],
			today=new Date();

		if(data.length){
			for(i;i<len;i++){

				if(today>(new Date(data[i].effectiveTime.substr(0,10)))){
					//过期
					++count3;
					data3.push(data[i])
				}else if(Number((data[i].frequency))){
					//可用
					++count1;
					data1.push(data[i])
				}else{
					//已用
					++count2;
					data2.push(data[i])
				}
			}

			$('.no-card').hide();

			$.each($('#user-cards .cardsWrap'),function(){
				var data;
				var _this=$(this);
				var id=_this.attr('id');

				if(id=='availableCardWrap'){
					data=data1
				}else if(id=='appliedCard'){
					data=data2;
				}else{
					data=data3;
				}
				if(data.length){
					_this.data('page',{
						data:data,
						numbersPerPage:5,
						getHtml:getCardsHtml
					})
					listRender(0,_this);
				}else{
					_this.html(noDataStr);
				}
			})
		}else{
			// html1=html2=html3=noDataStr;
			$('.no-card').show();
			$('#user-cards .cardsWrap').html(noDataStr)
		}
		$('a[href="#availableCard"] span').text(count1);
		$('a[href="#appliedCard"] span').text(count2);
		$('a[href="#expiredCard"] span').text(count3);
	}
	function getCardsHtml(index,renderLen,data){
		var cardCorner='<p class="card-corner">已过期</p>';
		var tpl,today=new Date();
		var html='';

		for(var i=0;i<renderLen;i++){
			tpl=userTemplatesObj.card;

			$.each(data[index+i],function(k,v){
				if(k=='effectiveTime'){
					v=date=v.substr(0,10);
				}
				else if(k=='cardNum'){
					v=v.toUpperCase();
				}
				else if(k=='frequency'){
					v=String(v);
				}
				v=v?v:'';
				tpl=tpl.replace('{'+k+'}',v);
			});
			tpl=tpl.replace('{pageIndex}',index+i);
			if(today>(new Date(date))){
				tpl=tpl.replace(/{cardCorner}/,cardCorner).replace('{cardImg}','<img src="img/yiyongcika.png">');
			}else if(Number((data[i].frequency))){
				tpl=tpl.replace(/{cardCorner}/,'').replace('{cardImg}','<img src="img/keyongcika.png">');
			}else{
				tpl=tpl.replace(/{cardCorner}/,'').replace('{cardImg}','<img src="img/yiyongcika.png">');
			}
			html+=tpl;
		}

		return html;
	}
	//次卡订单
	function getCardOrders(state){
		loginTEST(function(){
			var params=$.extend({},publicParams,{
				url:domain+paths.cardOrders,
				data:{
					ssid:ssid,
					state:state
				},
				success:function(data){
					data=$.parseJSON(data);

					requestCallBack(data,function(){
						insertCardOrders(data.data);
					})

				}
			})
			$.ajax(params);
		});
	}
	//订单填充
	function insertCardOrders(data){
		var i=0;
		var wrap=$('.user-orders-wrap .active');

		if(data.length){
			wrap.data('page',{
				data:data,
				numbersPerPage:10,
				getHtml:function(index,renderLen,data){
					var tpl;
					var html='';
					var state;

					for(var i=0;i<renderLen;i++){
						tpl=userTemplatesObj.cardOrder;

						$.each(data[index+i],function(k,v){
							v=v?v:'';
							tpl=tpl.replace('{'+k+'}',v);
						});

						tpl=tpl.replace('{pageIndex}',index+i);
						state=data[i+index].state;

						if(state=='3'){
							tpl=tpl.replace('{cancelShow}','show')
									.replace('{payShow}','show')
									.replace('{deleteShow}','');
						}else if(state=='0'){
							tpl=tpl.replace('{cancelShow}','')
									.replace('{payShow}','')
									.replace('{deleteShow}','');
						}else{
							tpl=tpl.replace('{cancelShow}','')
									.replace('{payShow}','')
									.replace('{deleteShow}','show');
						}
						html+=tpl;
					}

					return html;
				}
			})
			listRender(0,wrap);
		}else{
			wrap.html(noDataStr);
		}
	}
	//充值购买页面
	function resetBuyCard(){
		$('#card-count').val('');
		$('#card-money').html('0.00');
	}
	//按类型查询订单
	$('#card-orders')
	.on('click','li',function(){
		getCardOrders($(this).attr('type'))
	})
	//跳转购买
	$('#buy-card').click(function(){
		resetBuyCard();

		pageData={
			name:'buy-card-form',
			title:'选择次卡信息',
			hasBar:1,
			btns:null
		}
		loginTEST(function(){
			var params=$.extend({},publicParams,{
				url:domain+paths.cardTypes,
				data:{ssid:ssid},
				success:function(data){
					data=$.parseJSON(data);

					// requestCallBack(data,function(){
						cardTypesArr=data.data;

						var html='',tips='';
						$.each(data.data,function(k,v){
							var money=v.cardMoney?v.cardMoney:'0.00';
							html+='<option value="'+v.type+'" price="'+money+'" index="'+k+'">'+v.cardType+'</option>';
							tips+=v.cardType+'单价: <span class="ypt-fc-red">¥ '+money+'</span> 剩余张数: <span class="ypt-fc-red">'+v.number+'</span></br>'
						})
						$('#card-type').html(html);
						$('.buy-card-tips').html(tips);
						goToPage(pageData);
					// })

				}
			})
			$.ajax(params);
		});
	})
	//选择类型
	$('#card-type').change(function(){
		$('#card-count').trigger('keyup');
	})
	//购买个数
	$('#card-count').keyup(function(){
		var v=$(this).val();
		if(Number(v)){
			var total=Number(v)*Number($('#card-type option:selected').attr('price'));
			$('#card-money').html(total.toFixed(2).toLocaleString())
		}else if(!v){
			$('#card-money').html('0.00')
		}
	})
	//下一步
	$('#card-confirm').click(function(e){
		e.preventDefault();
		e.stopPropagation();

		var index=Number($('#card-type option:selected').attr('index')),
			cardObj=cardTypesArr[index],
			limit=cardObj.number,
			type=cardObj.type,
			count=$('#card-count').val();

		if(!Number(count)){
			showTipsModal('请输入有效的购买个数！')
			return;
		}else if(Number(count)>Number(limit)){
			showTipsModal('购买张数不能超过'+limit+'！')
			return;				
		}

		loginTEST(function(){
			var params=$.extend({},publicParams,{
				url:domain+paths.cardOrder,
				data:{
					ssid:ssid,
					type:type,
					number:count
				},
				success:function(data){
					data=$.parseJSON(data);
					console.dir(data);

					// requestCallBack(data,function(){
						$('#card-order-no').html(data.id);
						$('#pay-amt').html($('#card-money').html())
						goToPage({
							name:'pay-way',
							title:'选择支付方式',
							hasBar:1,
							btns:null
						});
					// })
				}
			})
			$.ajax(params);
		});
	})
	//支付方式
	$('#pay-way .list-group-item').click(function(e){
		e.preventDefault();
		e.stopPropagation();

		var icon=$(this).find('i');
		if(!icon.hasClass('chosen-pay')){
			$('#pay-way i').removeClass('chosen-pay')
			icon.addClass('chosen-pay')
		}
	})
	//立即支付
	$('#pay-for-card').click(function(e){
		e.preventDefault();
		e.stopPropagation();

		if(channle == "mobile"){
			//移动端浏览器
			loginTEST(function(){
				var params=$.extend({},publicParams,{
					url:domain+paths.cardPay,
					data:{
						id:$('#card-order-no').html(),
						payWay:$('#pay-way .chosen-pay').attr('payway')
					},
					success:function(data){
						data=$.parseJSON(data).data;
						console.dir(data);
						var content='<div id="modal-content">'+
									'<p>应付金额: <span class="ypt-fc-red">'+data.payMoney+'</span> 元</p>'+
									'<p style="text-align:center;"><img src="'+domain+data.code_path+'" style="width:50%;"></p>'+
									'</div>';

						var modal=$('#modal-code');
						$('.modal-title',modal).text('立即支付');
						$('.modal-body',modal).html(content);
						$('#modal-ok').attr('id',data.payId)
						modal.modal('show');

						if(timer)return;
						timer=setTimeout(function(){
							queryState(data.payId);
						},3000)
					}
				})
				$.ajax(params);
			});
		}else{
			//ios
			payOrder_Other(channle)
		}
	})
	//确定购买
	$('#modal-ok').click(function(){
		$('#modal-code').modal('hide')
	})
	//查询支付状态
	function queryState(id){
		loginTEST(function(){
			var params=$.extend({},publicParams,{
				url:domain+paths.payOrderQuery,
				data:{
					id:id,
					type:'0'
				},
				success:function(data){
					data=$.parseJSON(data);
					console.dir(data);

					if(data.statusCode=='200'){

						clearTimeout(timer);
						timer=null;
							
						if(data.data.state=='0'){
							//支付成功
							$('#modal-code').modal('hide');
							goToResultPage('您已成功购买次卡！');
						}else{
							//支付失败
							timer=setTimeout(function(){
								queryState(id);
							},3000)
						}
					}else{
						//请求异常
						$('#modal-code').modal('hide');
						showTipsModal('支付请求失败！');
						clearTimeout(timer);
						timer=null;
					}
				}
			})
			$.ajax(params);
		});
	}
	//绑定次卡
	$('#bind-card-ok').click(function(){
		var card=$('#bind-no').val(),
			pass=$('#bind-pass').val();

		if(!card){
			showTipsModal('请输入次卡卡号！');
			return;
		}
		if(!pass){
			showTipsModal('请输入密码！');
			return;				
		}

		loginTEST(function(){
			var params=$.extend({},publicParams,{
				url:domain+paths.cardBind,
				data:{
					ssid:ssid,
					password:pass,
					cardNum:card
				},
				success:function(data){
					data=$.parseJSON(data);
					console.dir(data);

					if(data.statusCode!='200'){
						showTipsModal(data.message+': '+data.data)
					}else{
						errorEle.hide().find('div').html('')
						bindCardTable.removeClass('active')
						bindCardResult.addClass('active');
					}
				}
			})
			$.ajax(params);
		})
	})
	//公众号 支付,调用微信支付
	function payOrder_Other(channle){
		var param={
			ssid:ssid,
			id: $('#card-order-no').html(),   //订单id
			payWay:"w", //（支付方式w微信z支付宝）
			spbill_create_ip:nowIP//微信支付时用户ip
		}
		loginTEST(function(){
			var params=$.extend({},publicParams,{
				url:domain+paths.iosPay,
				data:param,
				success:function(data){
					logs("统一支付完成");
					if(channle == "wechat"){
						//微信公众号支付
						wechatPay();
					}else{
						//ios原生支付
						iosPay();
					}
				}
			})
			$.ajax(params);
		})
	}
	//微信公众号支付方式
	function wechatPay(){
		if (typeof WeixinJSBridge == "undefined"){
			if( document.addEventListener ){
				document.addEventListener('WeixinJSBridgeReady', onBridgeReady, false);
			}else if (document.attachEvent){
				document.attachEvent('WeixinJSBridgeReady', onBridgeReady);
				document.attachEvent('onWeixinJSBridgeReady', onBridgeReady);
			}
		}else{
			onBridgeReady();
		}
	}
	//微信支付
	function onBridgeReady(){
		WeixinJSBridge.invoke(
			'getBrandWCPayRequest', {
				"appId":"wx2421b1c4370ec43b",     //公众号名称，由商户传入
				"timeStamp":"1395712654",         //时间戳，自1970年以来的秒数
				"nonceStr":"e61463f8efa94090b1f366cccfbbb444", //随机串
				"package":"prepay_id=u802345jgfjsdfgsdg888",
				"signType":"MD5",         //微信签名方式：
				"paySign":"70EA570631E4BB79628FBCA90534C63FF7FADD89" //微信签名
			},
			function(res){
				if(res.err_msg == "get_brand_wcpay_request:ok" ) {

					showTipsModal('支付成功！')
					// 使用以上方式判断前端返回,微信团队郑重提示：res.err_msg将在用户支付成功后返回    ok，但并不保证它绝对可靠。
				}
			}
		);
	}
	//ios支付
	function iosPay(){
		//zfb/wx,订单ID,支付金额,订单介绍
		var str = $(".chosen-pay").attr("payWay")+","+$("#card-order-no").html()+","+$('#pay-amt').html();
		console.log("ios支付串:"+str);
		window.webkit.messageHandlers.ticketPay.postMessage(str);
	}
	//ios支付成功
	function cardSuccess(){
		goToResultPage('支付成功！')
	}
	window.cardSuccess=cardSuccess;
	
	//获得当前IP
	function getIp(){
		$.ajax({
			url: 'http://freegeoip.net/json/',
			async: false,
			type: 'GET',
			dataType: 'JSON',
			success: function(data){
				nowIP = data.ip;
			}
		});
	}

	/*========收货地址=========*/
	//请求
	function queryAdrList(edit){
		loginTEST(function(){
			var params=$.extend({},publicParams,{
				url:domain+paths.adrList,
				data:{ssid:ssid},
				success:function(data){
					data=$.parseJSON(data);
					console.dir(data);

					requestCallBack(data,function(){
						insertAdrData(data.data);
						userDataObj.addressList=data.data;
					})
				}
			})
			$.ajax(params);
		})
	}
	//填充
	function insertAdrData(data){
		var i=0,len=data.length,html='',defaultAdr;
		var adrTpl='';
		var wrap=$('#user-address');

		if(data.length){

			wrap.data('page',{
				data:data,
				numbersPerPage:4,
				getHtml:function(index,renderLen,data){
					var adrTpl='',
						html='';
					for(var i=0;i<renderLen;i++){
						adrTpl=userTemplatesObj.address;
						adrTpl=adrTpl.replace((new RegExp('{index}','g')),index+i);
						$.each(data[index+i],function(k,v){
							if(k=='state'){
								v=Number(v)?'adr-default':'';
								adrTpl=adrTpl.replace('{className}',v)
							}else{
								adrTpl=adrTpl.replace(new RegExp('{'+k+'}','g'),v)
							}
						})
						html+=adrTpl;
					}
					return html;
				}
			});

			listRender(0,wrap)
		}else{
			html='<p class="no-data"><img src="img/no_address.png"></br><span>您还没有收货地址，赶快添加吧！</span><p>';
			wrap.html(html);
		}
		
	}
	//设置默认 跳转编辑和删除
	$('#user-address')
	.on('click','.setDefault',function(){
		var _this=$(this);

		if(_this.hasClass('adr-default'))return;

		var aid=_this.attr('aid');
		var obj=userDataObj.addressList[$(this).attr('index')];

		var data={
			name:obj.name,
			phone:obj.phone,
			province:obj.province,
			detail:obj.detail,
			state:'1',
			id:aid
		};
		loginTEST(function(){
			data.ssid=ssid;
			var params=$.extend({},publicParams,{
				url:domain+paths.updateAdr,
				data:data,
				success:function(data){
					data=$.parseJSON(data);
					if(data.statusCode=='200'){
						// goToResultPage(tips)
						$('#user-address .setDefault').removeClass('adr-default');
						_this.addClass('adr-default');
					}else{
						showTipsModal(data.message);
					}
					
				}
			})
			$.ajax(params);
		})


	})
	.on('click','.edit-address',function(){
		var aid=$(this).parent().attr('aid');
		var obj=userDataObj.addressList[$(this).attr('index')];

		$('#adr-name').val(obj.name);
		$('#adr-phone').val(obj.phone);
		$('#adr-detail').val(obj.detail);
		$('#adr-state').prop('checked',Boolean(Number(obj.state)));

		$('#save-address')
		.attr('action','edit')
		.attr('aid',aid);

		getArea();
		goToPage({
			name:'add-address',
			title:'编辑地址',
			hasBar:1,
			btns:null
		});
	})
	.on('click','.delete-address',function(){
		var id=$(this).parent().attr('aid');
		loginTEST(function(){
			var params=$.extend({},publicParams,{
				url:domain+paths.delAdr,
				data:{
					ssid:ssid,
					id:id
				},
				success:function(data){
					data=$.parseJSON(data);
					console.dir(data);
					showTipsModal('已删除！');
					queryAdrList();
				}
			})
			$.ajax(params);
		})
	})
	//添加和编辑提交
	$('#save-address').click(function(e){
		e.preventDefault();
		e.stopPropagation();

		var adrName=$('#adr-name').val(),
			adrPhone=$('#adr-phone').val(),
			adrDetail=$('#adr-detail').val();

		if(!adrName){
			showTipsModal('请填写收货人姓名')
			return;
		}
		if(!regExps.phone.test(adrPhone)){
			showTipsModal('请输入有效的手机号码');
			return;
		}
		if(!adrDetail){
			showTipsModal('请输入详细地址')
			return;
		}

		var areaInfo=$('#area-province option:selected').text()+
					$('#area-city option:selected').text()+
					$('#area-district option:selected').text();
		var url='',
			tips='',
			data={
				name:adrName,
				phone:adrPhone,
				province:areaInfo,
				detail:adrDetail,
				state:$('#adr-state').prop('checked')?'1':'0'
			};
		if($(this).attr('action')=='add'){
			url=domain+paths.addAdr;
			tips='您已成功添加新地址！';
		}else{
			url=domain+paths.updateAdr;
			data.id=$(this).attr('aid');
			tips='您已成功更新地址！'
		}

		loginTEST(function(){
			data.ssid=ssid;
			var params=$.extend({},publicParams,{
				url:url,
				data:data,
				success:function(data){
					data=$.parseJSON(data);
					if(data.statusCode=='200'){
						// goToResultPage(tips)
						queryAdrList();
						goBack(1)
					}else{
						showTipsModal(data.message);
					}
					
				}
			})
			$.ajax(params);
		})
	})
	//省市区change事件
	$('.area-select').change(function(){
		var id=$(this).attr('id');
		var cityData=[],districtData=[];
		var code=$(this).val();

		if(id=='area-province'){
			$.each(chinaAreaData.city,function(){
				var _code=this.code;
				if(_code.substr(0,2)==code&&_code.length==4){
					cityData.push({code:_code,name:this.name})
				}
			})
			areaInsert($('#area-city'),cityData);
			$('#area-city').trigger('change');
		}
		else if(id=='area-city'){
			$.each(chinaAreaData.district,function(){
				var _code=this.code;
				if(_code.substr(0,4)==code&&_code.length==6){
					cityData.push({code:_code,name:this.name})
				}
			})
			areaInsert($('#area-district'),cityData)
		}
	})
	//获取省市区
	function getArea(){
		if(!chinaAreaData){
			chinaAreaData={
				province:[],
				city:[],
				district:[]
			}

			$.each(chinaAreaArr,function(){
				var arr=this.split(':'),
					code=arr[0],
					name=arr[1];

				if(code.length==2){
					chinaAreaData.province.push({code:code,name:name})
				}
				else if(code.length==4){
					chinaAreaData.city.push({code:code,name:name})
				}
				else if(code.length==6){
					chinaAreaData.district.push({code:code,name:name})
				}
			})

			areaInsert($('#area-province'),chinaAreaData.province,function(){
				$('#area-province').trigger('change')
			})
		}
	}
	//填充省市区
	function areaInsert(ele,data,callback){
		var html='';
		if(!data.length){
			html='<option value="">请选择</option>';
		}else{
			$.each(data,function(){
				html+='<option value="'+this.code+'">'+this.name+'</option>'
			})
		}
		ele.html(html);
		callback && callback();
	}

	/*========我的订单=========*/
	var paiedOrders,
		unPaiedOrders,
		payTypeObj={'0':'无需付款','1':'微信','2':'支付宝','3':'联通'};

	//请求
	function ordersQuery(queryData,callBack){
		loginTEST(function(){
			var params=$.extend({},publicParams,{
				url:domain+paths.order,
				data:$.extend({ssid:ssid},queryData),
				success:function(data){
					data=$.parseJSON(data);
					console.dir(data);

					requestCallBack(data,function(){
						insertOrder(data.data);
						callBack && callBack();
					})
				}
			})
			$.ajax(params);
		})
	}
	//填充
	function insertOrder(data){
		var i=0,
			len=data.length,
			count1=0,count2=0,
			data1=[],data2=[];

		if(len){
			for(var i=0;i<len;i++){
				var state=data[i]['orderPayState'];
				if(state==1||state==3||state==4){
					count1++;
					data1.push(data[i]);
				}
				if(state==2){
					count2++;
					data2.push(data[i])
				}
			}

			paiedOrders=data1;
			unPaiedOrders=data2;

			$.each($('#user-orders div.tab-pane'),function(){
				var _this=$(this);
				var data=(_this.attr('id')=='paied')?data1:data2;

				_this.data('page',{
					data:data,
					numbersPerPage:5,
					getHtml:function(index,renderLen,data){
						var orderTpl='';
						var html='';
						for(var i=0;i<renderLen;i++){
							// if(data[index+i])
							orderTpl=userTemplatesObj.order;
							$.each(data[index+i],function(k,v){
								if(k=='representPathUrl'){
									v=v?domain+v:'img/demo.jpg';
								}
								v=v?v:'';
								orderTpl=orderTpl.replace((new RegExp('{'+k+'}','g')),v);
							})
							orderTpl=orderTpl.replace( (new RegExp('{project}','g')) ,'html/performInfo_m.html?id='+data[index+i].id);

							var state=data[index+i]['orderPayState'];
							if(state==1||state==3||state==4){
								orderTpl=orderTpl
								.replace('{className1}','showBtn')
								.replace('{className2}','')
								.replace('{className3}','');
							}
							if(state==2){
								orderTpl=orderTpl
										.replace('{className1}','')
										.replace('{className2}','showBtn')
										.replace('{className3}','showBtn');
							}
							orderTpl=orderTpl
									.replace('{pageIndex}',index+i)
									.replace('{className4}',Number(data[index+i].isassess)?'showBtn':'');

							html+=orderTpl;
						}

						return html;
					}
				})

				listRender(0,_this);
			})
		}else{
			$('#paied').html(noDataStr);
			$('#unPaied').html(noDataStr);
		}
		// $('#paiedNo').html(count1);
		// $('#unPaiedNo').html(count2);
	}
	
	$('#user-orders')
	//类型查询
	.on('click','li',function(e){
		var type=$(this).attr('type');
		ordersQuery({
			t:'',
			state:type
		})
	})
	//查看详情
	.on('click','.to-order-detail',function(e){
		// var type=$('#user-orders li.active').attr('type');
		// var index=Number($(this).parents('.order-item').attr('index'));
		var oid=$(this).attr('oid');
		var pid=$(this).attr('pid');
		// detailRender(type==2?unPaiedOrders[index]:paiedOrders[index]);

		loginTEST(function(){
			var params=$.extend({},publicParams,{
				url:domain+paths.showOrder,
				data:{
					ssid:ssid,
					id:oid
				},
				success:function(data){
					data=$.parseJSON(data);
					requestCallBack(data,function(){
						console.dir(data);
						detailRender(data.data,pid);
						goToPage({
							name:'order-detail',
							title:'订单详情',
							hasBar:1,
							btns:null
						});
					})
				}
			})
			$.ajax(params);
		})

	});

	$('#order-detail')
	//去支付
	.on('click','.detail-btn-pay',function(e){
		var oid=$(this).attr('oid');
		var orderMoney=$(this).attr('orderMoney');
		var pid=$(this).attr('pid');

		var str = new Base64().encode((orderMoney).toString());
		var str1 = new Base64().encode((oid).toString());
		window.location.href = "html/commitOrder_m.html?pid="+pid+"&price="+str+"&oid="+str1;
	})
	//去评价
	.on('click','.detail-btn-comment',function(e){
		var pid=$(this).attr('pid');
		var oid=$(this).attr('oid');

		$('#comment-content').val('');
		$('#comment-submit').attr('pid',pid).attr('oid',oid).data('from',$(this));

		$('.comment-img').attr('src',$('.order-pro-img img').attr('src'));
		$('.comment-title').html($('.detail-name').html());
		$('.comment-date').html($('.detail-sTime').html());

		goToPage({
			name:'order-comment',
			btns:null,
			hasBar:1,
			title:'发表评论'
		});
	})

	function detailRender(data,projectId){

		var imgSrc=data.representPathUrl? (domain+data.representPathUrl):'img/demo.jpg';
		$('.order-pro-img img').attr('src',imgSrc)

		$('.detail-name').html(data.name);
		$('.detail-sTime').html(data.startTime);
		$('.detail-site').html(data.siteName);
		$('.detail-money').html('&yen;'+data.receivableMoney);

		$('.order-oper-btns .btn')
		.attr('oid',data.id)
		.attr('orderMoney',data.orderMoney)
		.hide();

		if(data.orderPayState=='2'){
			$('.detail-state').html('未支付');
			$('.detail-pay').hide();
			$('.detail-btn-pay').show();
			$('#order-detail .ypt-fc-green').hide();
		}else{
			$('.detail-state').html('已支付');
			$('.detail-pay').show().find('span').html(payTypeObj[data.orderPayType]);
			$('.detail-btn-comment').show().attr('pid',projectId).attr('oid',data.id);
			$('#order-detail .ypt-fc-green').show();
		}
		
		$('.detail-address').html(data.distributionAddress);
		$('.detail-no').html(data.id);
		$('.detail-time').html(data.startTime);

		var unitPrice=data.unitPrice?data.unitPrice:'0.00',
			favorableMoney=data.favorableMoney?data.favorableMoney:'0.00',
			orderMoney=data.orderMoney?data.orderMoney:'0.00';
		$('.unitPrice').html('&yen;'+unitPrice+'×'+data.orderItemsCount)
		$('.favorableMoney').html('-&yen;'+favorableMoney)
		$('.orderMoney').html('&yen;'+orderMoney);

		var seatHtml='';
		if(data.seatList && data.seatList.length){
			$.each(data.seatList,function(){
				var txt,className;
				if(this.validateState==1){
					className='btn-default';
					txt='已验票';
				}else if(this.validateState==2){
					className='btn-primary';
					txt='未验票';
				}else if(this.validateState==3){
					className='btn-default';
					txt='已换票';
				}else if(this.validateState==4){
					className='btn-default';
					txt='已退票';
				}

				seatHtml+='<div class="seat-box"><div class="" style="float: left;line-height: 24px;">'+
		                        '<p class="ypt-fc-red">&yen;'+this.price+'</p>'+
		                        '<p class="ypt-f14 ypt-fc-grey">'+this.boundName+this.floorName+this.rowName+this.seatName+'</p>'+
		                        '<a class="code-btn btn '+className+'" style="padding: 2px 5px;">'+txt+'</a>'+
		                    '</div>'+
		                    '<div style="float: right;" class="seat-qrcode" qrcode="'+this.dynamicQRCode+'"></div></div>';
			})
			
		}else{
			seatHtml="无数据";
		}
		$('#seatList').html(seatHtml);

		$('.seat-qrcode').each(function(){
			var txt=$(this).attr('qrcode');
			$(this).qrcode({
				width:100,
				height:100,
				text:txt
			});
		})
	}
	//类型
	$('.second-menus a').click(function(e){
		e.preventDefault();
		e.stopPropagation();
		var type=$(this).attr('type');
		// ordersQuery({
		// 	t:'2',
		// 	state:''
		// },function(){
		if(type){
			$('#user-watch li').removeClass('active');
			$('#user-watch .tab-pane').removeClass('active');
			$(type).addClass('active');
			$('#user-watch li.'+type.replace('#','')).addClass('active');
			var queryType=$(this).attr('qType');

			goToPage({
				name:'user-watch',
				title:'我的观看',
				hasBar:1,
				btns:null
			},function(){
				watchQuery(queryType)
			})
		// })
		}else{
			goToPage({
				name:'user-comment',
				btns:null,
				hasBar:1,
				title:'我的评论'
			},function(){
				getComments($('#user-comment li.active').attr('state'));
			})
		}
	})
	//立即支付
	$('#unPaied')
	.on('click','.order-pay',function(){
		var oid=$(this).parent().attr('oid');
		var orderMoney=$(this).attr('orderMoney');
		var pid=$(this).parent().attr('pid');

		var str = new Base64().encode((orderMoney).toString());
		var str1 = new Base64().encode((oid).toString());
		window.location.href = "html/commitOrder_m.html?pid="+pid+"&price="+str+"&oid="+str1;

	})
	//取消订单
	.on('click','.order-cancel',function(){
		var oid=$(this).parent().attr('oid');
		loginTEST(function(){
			var params=$.extend({},publicParams,{
				url:domain+paths.delOrder,
				data:{
					ssid:ssid,
					id:oid
				},
				success:function(data){
					showTipsModal('订单已取消！');
					ordersQuery({
						t:'',
						state:$('#user-orders li.active').attr('type')
					});
				}
			})
			$.ajax(params);
		})
	})
	//删除订单
	// .on('click','.order-delete',function(){
	// 	var oid=$(this).parent().attr('oid');
	// 	loginTEST(function(){
	// 		var params=$.extend({},publicParams,{
	// 			url:domain+paths.delOrder,
	// 			data:{
	// 				ssid:ssid,
	// 				id:oid
	// 			},
	// 			success:function(data){
	// 				showTipsModal('订单已删除！');
	// 				ordersQuery({
	// 					t:'2',
	// 					state:''
	// 				});
	// 			}
	// 		})
	// 		$.ajax(params);
	// 	})
	// })
	//评价订单
	$('#paied')
	.on('click','.order-comment',function(){
		var pid=$(this).parent().attr('pid');
		var oid=$(this).parent().attr('oid');
		var table=$(this).parents('table');
		var item=$(this).parents('.order-item');
		var delAndAdr=item.find('.order-dateAndAdr');

		$('#comment-content').val('');
		$('#comment-submit').attr('pid',pid).attr('oid',oid).data('from',$(this));

		$('.comment-img').attr('src',item.find('img').attr('src'));
		$('.comment-title').html($('h2 a',item).html());
		$('.comment-date').html(delAndAdr.find('span').eq(0).html());

		goToPage({
			name:'order-comment',
			btns:null,
			hasBar:1,
			title:'发表评论'
		});
	})

	//提交评价
	$('#comment-submit').click(function(){
		var pid=$(this).attr('pid');
		var oid=$(this).attr('oid');
		var content=$('#comment-content').val();
		var obj=$(this).data('from')

		if(!content){
			showTipsModal('请输入评论内容！');
			return;
		}
		loginTEST(function(){
			var params=$.extend({},publicParams,{
				url:domain+paths.addComment,
				data:{
					ssid:ssid,
					projectId:pid,
					orderId:oid,
					content:content
				},
				success:function(data){
					console.log('评论成功数据')
					console.dir(data);

					showTipsModal('评论成功！');
					if(obj.hasClass('detail-btn-comment')){
						goBack(2,function(){
							ordersQuery({
								t:'',
								state:$('#user-orders li.active').attr('type')
							});
						})
					}else{
						goBack(1,function(){
							if(obj.hasClass('go-comment')){
								getComments($('#user-comment li.active').attr('state'));
							}else{
								ordersQuery({
									t:'',
									state:$('#user-orders li.active').attr('type')
								});
							}
						})
					}
					
				}
			})
			$.ajax(params);
		})
	})

	/*========我的评论=========*/
	//请求
	function getComments(state){
		loginTEST(function(){
			var params=$.extend({},publicParams,{
				url:domain+paths.comments,
				data:{
					ssid:ssid,
					state:state,
					param:{
						page:'1',
						rows:'10'
					}
				},
				success:function(data){
					data=$.parseJSON(data);
					console.log('评论数据')
					console.dir(data);

					requestCallBack(data,function(){
						insertComment(data.data);
					})
					
				}
			})
			$.ajax(params);
		})
	}
	//填充
	function insertComment(data){
		var len=data.length,
			wrap=$('#user-comment div.active'),
			state=$('#user-comment li.active').attr('state')

		if(data.length){
			wrap.data('page',{
				data:data,
				numbersPerPage:5,
				getHtml:function(index,renderLen,data){
					var html='',tpl;

					for(var i=0;i<renderLen;i++){
						tpl=userTemplatesObj.comment;
						$.each(data[index+i],function(k,v){
							if(k=='id'){
								v='html/performInfo_m.html?id='+v;
							}
							if(k=='representPathUrl'){
								v=v? domain+v:'img/demo.jpg';
							}
							tpl=tpl.replace((new RegExp('{'+k+'}','g')),v);
						})
						tpl=tpl
							.replace('{headImg}',userInfo.userHeadImage?domain+userInfo.userHeadImage:'img/userLogo.png')
							.replace('{userName}',userInfo.name)
							.replace('{pageIndex}',index+i)
							.replace('{cid}',data[index+i].id)
							.replace('{showOrHide}',state=='2'?'':'showBtn');

						html+=tpl;
					}

					return html;
				}
			})

			listRender(0,wrap);
		}else{
			wrap.html('<p class="no-data"><img src="img/no_comment.png" style="width:40%;"></br><span>您还没有评论</span></p>');
		}
	}
	//操作
	$('#user-comment')
	//按类型查询
	.on('click','li',function(){
		var state=$(this).attr('state');
		getComments(state);
	})
	//评价
	.on('click','.go-comment',function(){

		var pid=$(this).attr('cid');
		var oid=$(this).attr('oid');
		var parent=$(this).parent();

		$('#comment-content').val('');
		$('#comment-submit').attr('pid',pid).attr('oid',oid).data('from',$(this));

		$('.comment-img').attr('src',$('.project-img img',parent).attr('src'));
		$('.comment-title').html($('.project-info h2',parent).html());
		$('.comment-date').html($('.comment-user-date',parent).html());

		goToPage({
			name:'order-comment',
			btns:null,
			hasBar:1,
			title:'发表评论'
		});
	})

	/*========我的观看=========*/
	//请求
	function watchQuery(type){
		loginTEST(function(){
			var params=$.extend({},publicParams,{
				url:domain+paths.watchList,
				data:{
					ssid:ssid,
					type:type,
					param:{page:'',rows:''}
				},
				success:function(data){
					data=$.parseJSON(data);
					console.dir(data);

					requestCallBack(data,function(){
						insertWatch(data.data,type);
					});
				}
			})

			$.ajax(params);
		})
	}
	//填充
	function insertWatch(data,type){
		var wrap=Number(type)?$('#willWatch'):$('#watched');
		if(data.length){
			wrap.data('page',{
				data:data,
				numbersPerPage:5,
				getHtml:function(index,renderLen,data){
					var tpl;
					for(var i=0;i<renderLen;i++){
						tpl=userTemplatesObj.watch;
						$.each(data[index+i],function(k,v){
							if(k=='url'||k=='imagePath')v=domain+v;
							if(k=='status'){v=Number(data[index+i].type)?'待观看':'已观看';}
							tpl=tpl.replace('{'+k+'}',v);
						})
						tpl=tpl.replace('{pageIndex}',index+i);
						html+=tpl;
					}
				}
			})
			listRender(0,wrap);
		}else{
			wrap.html(noDataStr);
		}

		
	}
	//按类型查询
	$('#user-watch')
	.on('click','li',function(){
		watchQuery($(this).attr('type'))
	})

	/*========我的收藏=========*/
	//请求
	function favourQuery(type){
		loginTEST(function(){
			var params=$.extend({},publicParams,{
				url:domain+paths.favour1,
				data:{
					ssid:ssid,
					type:type,
					param:{page:'',rows:''}
				},
				success:function(data){
					data=$.parseJSON(data);
					console.dir(data);

					requestCallBack(data,function(){
						insertFavour(data.data);
					})
					
				}
			})

			$.ajax(params);
		})
	}
	//填充
	function insertFavour(data){
		var len=data.length,
			type=$('#user-favour li.active').find('a').attr('type'),
			wrap=Number(type)?$('#user-favour div.active table'):$('#user-favour div.active');

		if(data.length){
			wrap.data('page',{
				data:data,
				numbersPerPage:5,
				getHtml:function(index,renderLen,data){
					var html='',tpl='';

					for(var i=0;i<renderLen;i++){
						tpl=Number(type)?userTemplatesObj.favour1:userTemplatesObj.favour0;
						$.each(data[index+i],function(k,v){
							if(k=='createTime'){v=v.substr(0,10);}
							tpl=tpl.replace( (new RegExp('{'+k+'}','g')) ,v).replace('{pageIndex}',index+i);
						})
						html+=tpl;
					}
					return html;
				}
			});
			var noBefore=Number(type)?1:0;
			listRender(0,wrap,noBefore);

		}else{
			wrap.html('<p class="no-data"><img src="img/no_favour.png"></br><span>您还没有收藏</span><p>');
		}
	}
	//按类型查询
	$('#user-favour')
	.on('click','li',function(){
		favourQuery(Number($('a',this).attr('type')))
	})
	//取消关注
	$('#user-favour')
	.on('click','.cancel-favour',function(e){
		e.preventDefault();
		e.stopPropagation();

		var proId=$(this).attr('proId');

		loginTEST(function(){
			var params=$.extend({},publicParams,{
				url:domain+paths.delFav,
				data:{
					ssid:ssid,
					type:$('#user-favour li.active a').attr('type'),
					proId:proId
				},
				success:function(data){
					data=$.parseJSON(data);
					if(data.statusCode=='200'){
						showTipsModal('已取消！');
						favourQuery($('#user-favour li.active').find('a').attr('type'));
					}else{
						showTipsModal('请求失败，请重试。');
					}
				}
			})
			$.ajax(params);	
		})
	})

	/*========账户设置=========*/
	//头像
	$('#choose-img').click(function(){
		$('#chooseInput').trigger('click');
	})
	//选择
	$('#chooseInput').change(function(){
		var file=this.files[0];
		console.dir(file);

	    var reader=new FileReader();
	    console.log('读取：');
	    console.dir(reader.readAsDataURL(this.files[0]))
	    reader.onload=function(e){
	    	console.dir(e);
	    	$('#choose-img img').attr('src',e.target.result);

				var form=new FormData($('#uploadForm')[0]);
				form.append('ssid',ssid);
				loginTEST(function(){
					var params=$.extend({},publicParams,{
						url:domain+paths.changeHeadImg,
						data:form,
						processData:false,
						success:function(data){
							showTipsModal('上传成功!')
							data=$.parseJSON(data);
							console.dir(data);

							// insertComment(data.data);
						}
					})
					$.ajax(params);
				})

	    }
	});
	$('#save-acct').click(function(){
		var tips=checkForm($('#user-account'));
		if(tips){
			showTipsModal(tips);
			return;
		}
		loginTEST(function(){
			var userSex;
			$('.sexRadio').each(function(){
				if($(this).prop('checked')){
					userSex=$(this).attr('value')
				}
			})

			var birth=$('#birth-y option:selected').text()+'-'+$('#birth-m option:selected').text()+'-'+$('#birth-d option:selected').text();
			var params=$.extend({},publicParams,{
				url:domain+paths.changeInfo,
				data:{
					ssid:ssid,
					name:$('#user-name').val(),
					birth:birth,
					userSex:userSex
				},
				success:function(data){
					data=$.parseJSON(data);
					console.dir(data);
					getUserInfo(function(){
						goToResultPage('账户信息已修改！')
					})
					
				}
			})
			$.ajax(params);
		})
	})

	/*========意见反馈=======*/
	$('#feed-submit').click(function(){
		var feed=$('#feed-txt').val();
		if(!feed){
			showTipsModal('请填写意见内容！');
			return;
		}
		loginTEST(function(){
			var params=$.extend({},publicParams,{
				url:domain+paths.ideaSubmit,
				data:{
					ssid:ssid,
					content:feed
				},
				success:function(data){
					data=$.parseJSON(data);
					console.dir(data);

					goToResultPage('您的意见已提交！')
					$('#feed-txt').val('')
				}
			})
			$.ajax(params);
		})	
	})

	/*=========系统设置==========*/
	//退出
	$('#logOut').click(function(){
		loginTEST(function(){
			var params=$.extend({},publicParams,{
				url:domain+paths.logOut,
				data:{ssid:ssid,},
				success:function(data){
					data=$.parseJSON(data);
					console.dir(data);

					requestCallBack(data,function(){
						goToResultPage('已注销！');
						$('#user-login').removeClass('logIn').addClass('logOut').find('span').text('');
						$('#user-login').prev().addClass('logOutImg');
						// $('#user-birth').val(data.birth);
						var today=new Date();
						$('#birth-y').val(today.getFullYear());
						$('#birth-m').val(today.getMonth()).trigger('change');
						$('#birth-d').val(today.getDate());

						$('#user-name').val('');
						$('.user-name-txt').html('立即登录');
						$('.user-img img').attr('src','img/login_user.png')
					})
				}
			})
			$.ajax(params);
		})	
	})

	/*========公共方法=========*/
	//跳转
	function goToPage(pageData,callBack,isBack){
		var currentPage=$('.'+activeClass);

		//当前页淡出
		currentPage
		.stop()
		.fadeOut(duration,easing,function(){
			$(this)
			.removeClass(activeClass);

			//下一页导航
			if(pageData.hasBar){
				navBar.show()
				navBarRender(pageData);
			}else{
				navBar.hide()
			}

			var innerCallBack=callBack;
			
			//下一页淡入
			html.scrollTop(0);
			$('#'+pageData.name)
			.stop()
			.fadeIn(duration,easing,function(){
				$(this).addClass(activeClass);
				if(!isBack){
					navArrs.push(pageData);
				}else{
					if(timer){
						clearTimeout(timer);
						timer=null;
					}
				}

				innerCallBack && innerCallBack();
			})
		});
	}
	//返回
	function goBack(num,callBack){
		if(!num)return;
		if(num==1){
			navArrs.pop();
		}else if(num==2){
			navArrs.pop();
			navArrs.pop();
		}
		if(navArrs.length){
			var pageData=navArrs[navArrs.length-1];
			if(pageData){
				goToPage(pageData,callBack,true)
			}
		}
	}
	//跳转成功页面
	function goToResultPage(tips,pageData){
		var obj={
			name:'success-page',
			title:'',
			hasBar:false,
			btns:null
		}
		$('#success-tips').html(tips);
		goToPage(pageData?pageData:obj)
	}
	//返回首页
	function homeBack(){
		navArrs.splice(1);
		goToPage(navArrs[0],null,true);
	}
	//导航
	function navBarRender(data){
		$('.nav-btn',navBar).remove()

		pageTitle.text(data.title);

		if(data.hasBar){
			var btnsHtml='';
			if(data.btns && data.btns.length){
				for(var i=0;i<data.btns.length;i++){
					var className=data.btns.length==1?'one-btn':'';
					btnsHtml+='<a class="pageBtn nav-btn nav-btn'+i+' '+className+' '+data.btns[i].icon+'" action="'+data.btns[i].action+'">'+data.btns[i].text+'</a>'
				}
				pageTitle.after(btnsHtml);
			}
		}	
	}
	//弹出提示
	function showTipsModal(str,show){
		validateTips.html(str);
		validateWrap.modal('show');

		if(!show){
			setTimeout(function(){
				validateWrap.modal('hide');
			},2000)
		}
	}
	//校验
	function checkForm(form){
		var bool=true,
			tips='';
		$.each($('.form-control',form),function(){
			if(bool){
				var id=$(this).attr('id');
				if(!$(this).val()){
					bool=false;
					tips=$(this).attr('placeholder');
					
				}
			}
		})
		return tips;
	}

	/*========跳转处理=========*/
	cardCookie=Number($.cookie('myCard'))
	if(cardCookie){
		$('.main-menus a').eq(1).trigger('click');
		$.cookie('myCard',null);
	}

})

