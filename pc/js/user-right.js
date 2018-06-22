;(function(){

	/*====public====*/
	//公共变量
	var domain=ip,
		paths={
		//登陆
		login:"webMUser/go.wo",
		blurPass:"webMUser/tologin.wo",
		//个人订单
		order:'web/order/query.wo',
		delOrder:'web/order/del.wo',
		showOrder:'web/order/show.wo',
		//收货地址
		adrList:'web/muserrevaddress/queryMuserRevaddressById.wo',
		addAdr:'web/muserrevaddress/addMuserRevaddress.wo',
		delAdr:'web/muserrevaddress/deleteMuserRevaddress.wo',
		updateAdr:'web/muserrevaddress/updateMuserRevaddress.wo',
		//优惠券
		coupon:'web/coupon/queryByPhone.wo',
		//积分
		canSignPoints:'web/yptMuserIntegral/queryByToday.wo',
		signPoints:'web/yptMuserIntegral/addMuserIntegral.wo',
		points1:'web/yptMuserIntegral/queryMuserIntegralById.wo',
		//我的关注
		favour1:'web/yptcollection/query.wo',
		addFav:'web/yptcollection/addcoll.wo',
		delFav:'web/yptcollection/delcoll.wo',
		//我的观看
		watchList:'web/order/queryByWatch.wo',
		//次卡
		cardOrder:'web/yptcard/addCardOrder.wo',
		cardPay:'web/yptcard/webPaycard.wo',
		cardQuery:'web/yptcard/query.wo',
		cardTypes:'web/yptcard/selectSale.wo',
		cardShow:'web/yptcard/show.wo',
		cardBind:'web/yptcard/updatephone.wo',
		payOrderQuery:'web/yptcard/queryState.wo',
		//我的评论
		addComment:'web/comment/add.wo',
		comments:'web/order/queryByEvaluate.wo',
		//个人信息
		changeInfo:'webMUser/changeMUserInfo.wo',
		ideaSubmit:'web/opinion/addopinion.wo',
		changeHeadImg:'webMUser/changeHeadImage.wo',
		changeHeadImg2:'webMUser/changeHeadImageByPath.wo'
	},
	noDataStr='<p style="text-align:center;padding:10px 0 0 0;">未查询到任何数据</p>',
	publicParams={
		url:'',
		type:'POST',
		data:{},
		success:function(data){
			console.log('success',data);
		},
		error:function(error){
			alert('请求失败');
			console.log('error:',error)
		}
	},
	methodObj={},
	cardTypesArr,
	chinaAreaData=null,
	timer=null,
	headImageSrc='',
	timerCount=0,
	regExps={
		phone:/^1[3|4|5|8][0-9]\d{8}$/
	};

	//登陆验证
	function login(callback){
		var params=$.extend({},publicParams,{
			url:domain+paths.blurPass,
			success:function(data){
				//已加密
				data=$.parseJSON(data);
				console.dir(data);
				if(data.statusCode!='200'){
					alert('请求失败！');
					return;
				}
				var key = RSAUtils.getKeyPair(data.data.exponent,"",data.data.modulus),
					pwd = RSAUtils.encryptedString(key,encodeURIComponent(publicPass));
					ssid=data.data.ssid;

				var params=$.extend({},publicParams,{
					url:domain+paths.login,
					data:{
						ssid:ssid,
						tel:publicPhone,
						password:pwd
					},
					success:function(data){
						//已登录
						data=$.parseJSON(data);
						if(data.statusCode!='200'){
							alert('登陆失败！');
							return;
						}
						console.dir(data);
						ssid=data.ssid;
						callback && callback(data);
					}
				});
				$.ajax(params);
			}
		});

		$.ajax(params);
	}
	//校验提示
	function showCheckWarn(ele,tips){
		tips=tips?tips:ele.attr('placeholder');
		ele.parent().next().html('<div class="alert alert-danger" role="alert">'+tips+'</div>').show()
	}
	//隐藏提示
	function removeWarn(ele){
		ele.parent().next().html('').hide();
	}
	//隐藏弹框
	function closeModal(modal){
		setTimeout(function(){
			modal.modal('hide');
		},1800);
	}
	//请求回调处理
	function requestCallBack(e1,success,fail){
		if(e1.statusCode == 200){
			ssid = e1.ssid;
			logs("set:"+ssid);
			localStorage.setItem('ssid', ssid);
			success && success()
		}else if(e1.statusCode == 301){
			alert(e1.message);
			//需要登录，清除cookie
			$.cookie('user_info', null, { expires: -1,path: '/'});
			window.location.href = "login.html"
		}else{
			alert(e1.message);
			fail && fail();
		}
	}
	//base64转blob
	function getBase64(src) {

		function getBase64Image(img) {
		    var canvas = document.createElement("canvas");
		    canvas.width = img.width;
		    canvas.height = img.height;
		    var ctx = canvas.getContext("2d");
		    ctx.drawImage(img, 0, 0, img.width, img.height);
		    var ext = img.src.substring(img.src.lastIndexOf(".")+1).toLowerCase();
		            var dataURL = canvas.toDataURL("image/"+ext);
		    return dataURL;
		}

		var image = new Image();
		image.src = src;

		image.onload = function(){
		    var base64 = getBase64Image(image);
		    console.log('base64',base64);
		}
	}
	/*====Dom Ready====*/
	$(function(){

		//菜单控制
		var menus=$('#ypt-user-left-menus a'),
			mainContent=$('#ypt-main-content'),
			contents=$('.user-content-block'),
			validateWrap=$('#validate-wrap'),
			validateTips=$('#validate-tips');
		//点击菜单
		menus.click(function(e){
			e.preventDefault();
			e.stopPropagation();
			var index=menus.index($(this));
			menus.removeClass('active');
			$(this).addClass('active');
			contents.removeClass('active');
			contents.eq(index).addClass('active');

			var m=$(this).attr('method');
			if(m){
				methodObj[m]()
			};
		});
		//弹出提示
		function alert(str,bool){
			validateTips.html(str);
			validateWrap.modal('show');
			closeModal(validateWrap);
		}
		//规则说明
		$('.modal-intro').click(function(){
			var modal=$(this);
			$('#modal-intro .modal-title').text(modal.text());
			$('.intro-block').hide();
			$('.'+modal.attr('modal')).show();

			$('#modal-intro').modal('show');
			// closeModal($('#modal-intro'));
		})

		/*==我的订单==*/
		//模板
		var orderTpl=document.getElementById('orderTpl').innerHTML,
			orderState={
				'1':'已支付',
				'2':'未支付',
				'3':'已支付',
				'4':'已支付'
			},
			payTypeObj={'0':'无需付款','1':'微信','2':'支付宝','3':'联通'};
		//请求
		function ordersQuery(queryData){
			loginTEST(function(){
				var params=$.extend({},publicParams,{
					url:domain+paths.order,
					data:$.extend({ssid:ssid},queryData),
					success:function(data){
						data=$.parseJSON(data);
						console.dir(data);

						requestCallBack(data,function(){
							insertOrder(data.data);
							$('.user-order-list-box').show();
							$('.user-order-detail-box').hide();							
						});
					}
				})
				$.ajax(params);
			})
		}
		//填充
		function insertOrder(data){
			var i=0,
				len=data.length,
				html='',
				tpl=orderTpl;

			var count1=count2=0;
			var pages=$('#ypt-user-order-list .listPages');

			for(i;i<len;i++){
				$.each(data[i],function(k,v){
					if(k=='orderPayState'){
						if(v==1||v==3||v==4){
							count1++;
						}else if(v==2){
							count2++;
						}
					}
				})
			}

			if(data.length){
				pages
				.show()
				.data('page',{
					numbersPerPage:9,
					pagesPerLine:5,
					data:data,
					len:data.length,
					contentWrap:$('.ypt-user-order-item'),
					pagesWrap:pages,
					getHtml:getOrdersHtml
				});
				getPages(0,pages);
			}else{
				html=noDataStr;
				$('.ypt-user-order-item').html(html);
				pages.hide();
			}
			$('#paied-nums').html(count1);
			$('#unPaied-nums').html(count2);
			
		};
		function getOrdersHtml(index,numbersPerPage,data){

			var i=0,tpl='',html='';

			for(i;i<numbersPerPage;i++){
				tpl=orderTpl;
				if(data[index+i]){
					$.each(data[index+i],function(k,v){
						if(k=='orderPayState'){
							if(v==1||v==3||v==4){
								tpl=tpl.replace('{displayClass1}','hideBtn')
										.replace('{displayClass2}','hideBtn')
										.replace('{displayClass3}','hideBtn');
								if(Number(data[index+i].isassess)){
									tpl=tpl.replace('{displayClass4}','hideBtn').replace('{displayClass5}','showBtn');
								}else{
									tpl=tpl.replace('{displayClass4}','showBtn').replace('{displayClass5}','hideBtn');
								}
								
							}
							if(v==2){
								tpl=tpl.replace('{displayClass1}','showBtn')
										.replace('{displayClass2}','showBtn')
										.replace('{displayClass3}','hideBtn')
										.replace('{displayClass4}','hideBtn')
										.replace('{displayClass5}','hideBtn');
							}
							v=orderState[String(v)];
						}
						if(k=='representPathUrl'){
							v=v? domain+v:'../img/demo.jpg';
						}
						if(k=='projectUrl'){
							v=domain+v;
						}
						if(k=='seatOrder'){
							v=v.split(',').join('</br>');
						}
						if(k=='unitPrice'){
							var arrHtml='';
							$.each(v.split(','),function(k,v){
								arrHtml+='&yen;'+v+'</br>'
							})
							v=arrHtml;
						}
						v=v?v:'';
						tpl=tpl.replace((new RegExp('{'+k+'}','g')),v);
					})
					html+=tpl;
				}
			}

			return html;
		}
		//查询订单
		$('.order-select a').click(function(e){
			e.preventDefault();
			e.stopPropagation();

			var time=$(this).attr('time');
			if(time){
				$('a',$(this).parent()).removeClass('active');
				$(this).addClass('active');
				$('#orderT').text($(this).text())

				ordersQuery({
					t:time,
					state:$('.order-status .active').attr('state')
				})
			}else{
				$('a',$(this).parent()).removeClass('active');
				$(this).addClass('active');
				$('#orderSta').text($(this).text())

				ordersQuery({
					t:$('.order-sortby-date .active').attr('time'),
					state:$(this).attr('state')
				})	
			}
			$(document).trigger('click')
		})
		//删除订单
		$('.ypt-user-order-item')
		.on('click','.order-delete',function(){
			var oid=$(this).attr('oid');
			loginTEST(function(){
				var params=$.extend({},publicParams,{
					url:domain+paths.delOrder,
					data:{
						ssid:ssid,
						id:oid
					},
					success:function(data){
						alert('已删除！');
						ordersQuery({
							t:$('.order-sortby-date .active').attr('time'),
							state:$('.order-status .active').attr('state')
						});
					}
				})
				$.ajax(params);
			})
		})
		//查看详情
		.on('click','.to-order-detail',function(){
			var oid=$(this).attr('oid');
			var pid=$(this).attr('pid');
			var orderMoney=$(this).attr('orderMoney');

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
							console.dir(data)
							renderDetail(data.data);
							$('.user-order-list-box').hide();
							$('.user-order-detail-box').show();
							$('.detail-btn').attr('pid',pid).attr('oid',oid);

							var str = new Base64().encode((orderMoney).toString());
							var str1 = new Base64().encode((oid).toString());
							$('.detail-pay-btn').attr('href',"commitOrderSuccess.html?pid="+pid+"&price="+str+"&oid="+str1)						
						})
					}
				})
				$.ajax(params);
			})
		})
		//去付款
		.on('click','.order-pay-btn',function(){
			var oid=$(this).parent().attr('oid');
			var orderMoney=$(this).parent().attr('orderMoney');
			var pid=$(this).parent().attr('pid');

			var str = new Base64().encode((orderMoney).toString());
			var str1 = new Base64().encode((oid).toString());
			window.location.href = "commitOrderSuccess.html?pid="+pid+"&price="+str+"&oid="+str1;
		})
		//取消订单
		.on('click','.order-cancel-btn',function(){
			var oid=$(this).parent().attr('oid');
			loginTEST(function(){
				var params=$.extend({},publicParams,{
					url:domain+paths.delOrder,
					data:{
						ssid:ssid,
						id:oid
					},
					success:function(data){
						alert('已取消！');
						ordersQuery({
							t:$('.order-sortby-date .active').attr('time'),
							state:$('.order-status .active').attr('state')
						});
					}
				})
				$.ajax(params);
			})
		})
		//去评价
		.on('click','.order-comment-btn',function(){
			var pid=$(this).parent().attr('pid');
			var oid=$(this).parent().attr('oid');
			var tr=$(this).parent().parent();
			var table=tr.parent();
			var name=$('.to-order-detail',tr).html();
			var time=$('.start-time',table).attr('st');

			$('#comment-submit').attr('pid',pid).attr('oid',oid).data('from',$(this));
			$('.comment-img img').attr('src',table.find('img').attr('src'));
			$('#comment-content').val('');
			$('#comment-title').html(name);
			$('#comment-date span').html(time)
			$('#comment-form').modal('show');
		})

		//详情页
		function renderDetail(data){
			$('.detail-pay').html(orderState[String(data.orderPayState)]);
			$('.detail-order').html(data.id);
			$('.detail-time').html(data.startTime);
			$('.detail-person').html('');
			$('.detail-phone').html(data.orderNum);
			$('.detail-address').html(data.distributionAddress);

			//座位信息
			$('.seatList-tr').remove();
			var tdsHtml='';
			if(data.seatList && data.seatList.length){
				$.each(data.seatList,function(){
					tdsHtml+='<tr class="seatList-tr"><td class="detail-pro-name">'+this.projectName+'</td>'+
							'<td>'+this.boundName+this.floorName+this.rowName+this.seatName+'</td>'+
							'<td class="ypt-fc-red">&yen;'+this.price+'</td>'+
							'<td>1</td>'+
							'<td class="ypt-fc-red">&yen;'+this.orderGoodsReceiveMoney+'</td>'+
							'<td class="seat-qrcode" qrcode="'+(this.dynamicQRCode? this.dynamicQRCode:'')+'" style="text-align:right;"></td></tr>'
				});
				$('#detail-header').after(tdsHtml);
				$('.seat-qrcode').each(function(){
					var txt=$(this).attr('qrcode');
					if(txt){
						$(this).qrcode({
							width:100,
							height:100,
							text:txt
						});
					}
				})
			}else{
				tdsHtml+='<tr class="seatList-tr"><td colspan="6">数据为空</td></tr>';
				$('#detail-header').after(tdsHtml);
			}
			

			// $('#detail-pro-name').html(data.name);
			// $('#seatOrder').html(data.seatOrder.split(',').join('</br>'));
			// $('#unitPrice').html('&yen;'+data.unitPrice);
			// $('#orderItemsCount').html(data.orderItemsCount);
			// $('#receivableMoney').html('&yen;'+data.receivableMoney);

			if(data.orderPayState==1||data.orderPayState==3||data.orderPayState==4){
				$('.detail-pay').addClass('ypt-fc-green');
				$('.detail-pro-btn')
					.show()
					.attr('pname',data.name)
					.attr('oid',data.id)
					.attr('pid',data.pid)
					.attr('imgsrc',data.representPathUrl?domain+data.representPathUrl:'../img/demo.jpg');
				$('.detail-pay-btn').hide();
			}else{
				$('.detail-pay').removeClass('ypt-fc-green');
				$('.detail-pro-btn').hide();
				$('.detail-pay-btn').show();
			}

			var payType=data.orderPayType?data.orderPayType:'';
			if(String(payType)){
				$('#orderPayType').html(payTypeObj[payType])
				$('.detail-pro-pay').show()
			}else{
				$('.detail-pro-pay').hide();
			}
			
			var couponDiscountMoney=data.couponDiscountMoney?data.couponDiscountMoney:'0.00',
				favorableMoney=data.favorableMoney?data.favorableMoney:'0.00',
				orderMoney=data.orderMoney?data.orderMoney:'0.00';
			$('#couponDiscountMoney').html('-&yen;'+couponDiscountMoney)
			$('#favorableMoney').html('-&yen;'+favorableMoney)
			$('#orderMoney').html('&yen;'+orderMoney)
		}
		//去评价
		$('.detail-pro-btn').click(function(){
			var pid=$(this).attr('pid');
			var oid=$(this).attr('oid');
			var src=$(this).attr('imgsrc');
			var title=$(this).attr('pname')

			$('#comment-submit').attr('pid',pid).attr('oid',oid).data('from',$(this));
			$('.comment-img img').attr('src',src);
			$('#comment-content').val('');
			$('#comment-title').html(title);
			$('#comment-date span').html($('.detail-time').html())
			$('#comment-form').modal('show');
		})
		//评论提交
		$('#comment-submit').click(function(){
			var _this=$(this);
			var pid=_this.attr('pid');
			var oid=_this.attr('oid');
			var content=$('#comment-content').val();

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

						var btn=_this.data('from');
						$('#comment-form').modal('hide');
						if(btn.hasClass('order-comment-btn')){
							btn.removeClass('showBtn').addClass('hideBtn').next().removeClass('hideBtn').addClass('showBtn');
						}
						if(btn.hasClass('go-comment')){
							getComments($('#ypt-user-comments-list li.active').attr('state'));
						}
						alert('评论成功！');
					}
				})
				$.ajax(params);
			})
		});
		//执行
		methodObj.ordersQuery=function(){
			ordersQuery({
				t:$('.order-sortby-date .active').attr('time'),
				state:$('.order-status .active').attr('state')
			})
		}


		/*==我的次卡==*/
		//模板
		var cardTpl=document.getElementById('cardTpl').innerHTML,
			modalWrap=$('#modal-wrap'),
			modalTitle=$('#modal-title'),
			modalBody=$('#modal-body');
		//请求
		function cardsQuery(){

			$('#ypt-user-card-none').hide();
			$('#ypt-user-card-get').hide();
			$('#card-main-title').show();
			$('#ypt-user-card').show();
			
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

			var len=data.length,
				count1=0,count2=0,count3=0,
				data1=[],data2=[],data3=[],
				today=new Date(),date;

			if(len){
				for(var i=0;i<len;i++){
					if(today>(new Date(date))){
						++count3;
						data3.push(data[i]);
					}else if(Number((data[i].frequency))){
						++count1;
						data1.push(data[i]);
					}else{
						++count2;
						data2.push(data[i]);
					}
				}

				//翻页
				var pages=$('#ypt-user-card .listPages');
				$.each(pages,function(){
					var _self=$(this);
					var wrap=$(this).prev();
					var id=wrap.parent().attr('id');

					if(id=="availableCard"){
						data=data1;
					}else if(id=="appliedCard"){
						data=data2;
					}else{
						data=data3;
					}
					if(data.length){
						$(this).data('page',{
							numbersPerPage:9,
							pagesPerLine:5,
							data:data,
							len:data.length,
							contentWrap:wrap,
							pagesWrap:_self,
							getHtml:getHtml
						});
						getPages(0,$(this));
					}else{
						wrap.html(noDataStr)
					}
				})
			}else{

				$('#ypt-user-card .cardsWrap').html(noDataStr)
				$('#ypt-user-card-none').show();
				$('#ypt-user-card-get').hide();
				$('#card-main-title').hide();
				$('#ypt-user-card').hide();
			}
			$('a[href="#availableCard"] span').text(count1);
			$('a[href="#appliedCard"] span').text(count2);
			$('a[href="#expiredCard"] span').text(count3);
		}
		function getHtml(index,numbersPerPage,data){
			var i=0,html='',
				tpl,date,
				today=new Date();

			for(i;i<numbersPerPage;i++){
				tpl=cardTpl;
				if(data[index+i]){
					$.each(data[index+i],function(k,v){
						if(k=='effectiveTime'){
							v=date=v.substr(0,10);
						}else if(k=='cardNum'){
							v=v.toUpperCase();
						}
						v=String(v)?v:'';
						tpl=tpl.replace('{'+k+'}',v);
					})

					if(today>(new Date(date))){
						tpl=tpl.replace(/{cardCorner}/,cardCorner);
					}else if(Number((data[i].frequency))){
						tpl=tpl.replace(/{cardCorner}/,'');
					}else{
						tpl=tpl.replace(/{cardCorner}/,'');
					}
					html+=tpl;
				}
			}

			return html;
		}
		//购买次卡
		var priceObj={'1':10,'10':80},
			cardTypes=$('.card-types');
		//跳转购买
		$('.buy-card').click(function(){
			$('#card-main-title').hide();
			$('#ypt-user-card').hide();
			$('#ypt-user-card-none').hide();
			$('#ypt-user-card-get').show();

			if($(this).attr('id')=='rebuy-card'){
				$('.ypt-user-card').hide();
				$('.card-pro-box').hide().eq(0).show();

				$('#card-count').val('');
				$('#card-money').html('0.00');
				
				$('.card-get-head th').removeClass('active passed').eq(0).addClass('active');
			}
			loginTEST(function(){
				var params=$.extend({},publicParams,{
					url:domain+paths.cardTypes,
					data:{ssid:ssid},
					success:function(data){
						data=$.parseJSON(data);
						console.dir(data.data);
						// requestCallBack(data,function(){
							cardTypesArr=data.data;

							var html='';
							$.each(data.data,function(k,v){
								var className=!k?'active':'';
								var money=v.cardMoney?v.cardMoney:'0.00';
								html+='<p><a index="'+k+'" class="btn btn-primary card-type-btn '+className+'" type="'+v.type+'">'+v.cardType+'</a>'+
									'<span>价格(元): <strong class="ypt-fc-red">'+money+'</strong> '+'剩余(张): <strong class="ypt-fc-red">'+this.number+'</strong></span></p>';
							})
							cardTypes.html(html)
						// })
					}
				})
				$.ajax(params);
			});
		})
		//次卡类型
		cardTypes.on('click','.card-type-btn',function(e){
			e.preventDefault();
			e.stopPropagation();
			if($(this).hasClass('active'))return;

			$('.card-types .active').removeClass('active');
			$(this).addClass('active');
			$('#card-count').trigger('keyup')
		})
		//购买个数
		$('#card-count').keyup(function(){
			var v=$(this).val();
			if(Number(v)){
				var index=$('.card-types .active').attr('index');
				var price=Number(cardTypesArr[Number(index)].cardMoney);
					price=price || 0;
				var total=Number(v)*price;
				$('#card-money').html(total.toFixed(2).toLocaleString())
			}else if(!v){
				$('#card-money').html('0.00')
			}
		})
		//下一步
		$('#card-confirm').click(function(e){
			e.preventDefault();
			e.stopPropagation();

			var index=Number($('.card-types .active').attr('index')),
				cardObj=cardTypesArr[index],
				limit=cardObj.number,
				type=cardObj.type,
				count=$('#card-count').val();
			if(!Number(count)){
				showCheckWarn($('#card-count'),'请输入有效的购买个数！')
				return;
			}else if(Number(count)>Number(limit)){
				showCheckWarn($('#card-count'),'购买张数不能超过'+limit+'！')
				return;				
			}else{
				removeWarn($('#card-count'))
			}
			loginTEST(function(){
				var params=$.extend({},publicParams,{
					url:domain+paths.cardOrder,
					data:{
						ssid:ssid,
						type:cardObj.type,
						number:count
					},
					success:function(data){
						try{
							data=$.parseJSON(data);
							console.dir(data);
							$('.get-step1-box').hide();
							$('.get-step1').addClass('passed');
							$('.get-step2').addClass('active');
							$('.get-step2-box').show();

							$('#card-order-no').html(data.id);
							$('.pay-amt').html($('#card-money').html());
						}catch(e){
							console.dir(e);
							alert('订单生成失败，请重新购买。')
						}

					}
				})
				$.ajax(params);
			});

		})
		//支付方式
		$('.card-pay .tab-pane a').click(function(e){
			e.preventDefault();
			e.stopPropagation();
			if($(this).hasClass('chosen-bank'))return;
			$('.chosen-bank',$(this).parents('table')).removeClass('chosen-bank');
			$(this).addClass('chosen-bank');
		})
		//立即支付
		$('#pay-for-card').click(function(e){
			e.preventDefault();
			e.stopPropagation();

			loginTEST(function(){
				var params=$.extend({},publicParams,{
					url:domain+paths.cardPay,
					data:{
						id:$('#card-order-no').html(),
						payWay:$('#payChannel a.chosen-bank').attr('way')
					},
					success:function(data){
						try{
							data=$.parseJSON(data).data;
							console.dir(data);
							var content='<div id="modal-content">'+
										'<p>应付金额: <span class="ypt-fc-red">'+data.payMoney+'</span> 元</p>'+
										'<p style="text-align:center;"><img src="'+domain+data.code_path+'" style="width:50%;"></p></div>';

							modalTitle.text('立即支付');
							modalBody.html(content);
							$('#modal-ok').attr('pid',data.payId)
							modalWrap.modal('show');

							if(timer)return;
							// timer=setTimeout(function(){
								queryState(data.payId);
							// },3000)
							
						}catch(e){
							alert('二维码生成失败，请重新购买。')
						}
					}
				})
				$.ajax(params);
			});
		})
		//确定购买
		$('#modal-ok').click(function(){
			modalWrap.modal('hide')
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
								timerCount=0;
								//支付成功
								modalWrap.modal('hide');
								alert('支付成功！');
								$('.get-step3').addClass('active');
								$('.get-step3-box').show();
								$('.get-step2-box').hide();
								$('.get-step2').addClass('passed');
							}else{
								//支付失败
								timerCount++;
								if(timerCount<300){
									timer=setTimeout(function(){
										queryState(id);
									},3000)
								}
							}
						}else{
							//请求异常
							modalWrap.modal('hide');
							alert('支付请求失败！');
							clearTimeout(timer);
							timer=null;
							timerCount=0;
						}
					}
				})
				$.ajax(params);
			});
		}
		//购买完成
		$('#card-pay-finished').click(function(e){
			e.preventDefault();
			e.stopPropagation();

			$('#ypt-user-card-get').hide();
			$('#card-main-title').show();
			$('#ypt-user-card').show();
			cardsQuery();
		})
		//次卡规则
		$('#card-info').click(function(){
			$('#modal-intro .modal-title').text('次卡规则');
			$('.intro-block').hide();
			$('.card-intro').show();

			$('#modal-intro').modal('show');
			closeModal($('#modal-intro'));
		})
		var bindCardTable=$('#bind-card-table'),
			bindCardResult=$('#bind-card-result'),
			bindCardForm=$('#bind-card-form'),
			bindCardBtn=$('#bind-card-ok');
		//跳转绑定
		$('#bind-card').click(function(){
			$('.bind-card-box').removeClass('active');
			bindCardTable.addClass('active');

			$('#bind-phone').val('');
			$('#bindPwd').val('');
			$('#card-no').val('');
			$('#bind-error').hide().find('div').html('')
			bindCardForm.modal('show');
		})
		//绑定次卡
		bindCardBtn.click(function(){
			var phone=$('#bind-phone').val(),
				card=$('#card-no').val(),
				pass=$('#bindPwd').val(),
				errorEle=$('#bind-error');

			// if(!regExps.phone.test(phone)){
			// 	errorEle.show().find('div').html('请输入有效的手机号码！');
			// 	return
			// }
			if(!card){
				errorEle.show().find('div').html('请输入次卡卡号！');
				return;
			}
			if(!pass){
				errorEle.show().find('div').html('请输入密码！');
				return;				
			}
			errorEle.hide().find('div').html('')

			if(bindCardTable.hasClass('active')){
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
							requestCallBack(data,function(){
								errorEle.hide().find('div').html('');
								bindCardTable.removeClass('active')
								bindCardResult.addClass('active');
							},function(){
								errorEle.show().find('div').html(data.data)
							})
						}
					})
					$.ajax(params);
				})
			}else{
				$('#ypt-user-card-none').hide();
				bindCardForm.modal('hide');
				cardsQuery();
			}
		})
		methodObj.cardsQuery=function(){
			cardsQuery();
		};


		// /*==我的优惠券==*/
		// //模板
		// var couponTpl=document.getElementById('couponTpl').innerHTML;
		// //请求
		// function couponsQuery(){
		// 	loginTEST(function(userData){
		// 		var params=$.extend({},publicParams,{
		// 			url:domain+paths.coupon,
		// 			data:{
		// 				ssid:ssid,
		// 				phone:userData.tel
		// 			},
		// 			success:function(data){
		// 				data=$.parseJSON(data);
		// 				console.dir(data);

		// 				insertCoupons(data.data);
		// 			}
		// 		})
		// 		$.ajax(params);
		// 	})
		// }
		// //填充
		// function insertCoupons(data){

		// 	var i=0,
		// 		len=data.length,
		// 		html='',
		// 		tpl=couponTpl;

		// 	if(data.length){
		// 		for(i;i<len;i++){
		// 			$.each(data[i],function(k,v){
		// 				tpl=tpl.replace('{'+k+'}',v);
		// 			})
		// 			html+=tpl;
		// 			tpl=couponTpl;
		// 		}
		// 		$('#availableCoupon').append(html);
		// 	}else{
		// 		html=noDataStr;
		// 		alert('未查询到任何数据，当前数据为演示数据！')
		// 	}
		// }
		// methodObj.couponsQuery=couponsQuery;


		/*==我的积分==*/
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
			var wrap=$('#available table');
			if(data.length){
				var pages=$('#ypt-user-points .listPages');
				pages.data('page',{
					numbersPerPage:9,
					pagesPerLine:5,
					data:data,
					len:data.length,
					contentWrap:wrap,
					pagesWrap:pages,
					getHtml:getPointsHtml
				});
				getPages(0,pages);
			}else{
				wrap.html('<tr><td>'+noDataStr+'</td></tr>');
			}
		};
		function getPointsHtml(index,numbersPerPage,data){
			var i=0,html='',
				thead='<tr>'+
                        '<th>积分获取</th>'+
                        '<th>积分数</th>'+
                        '<th>获取日期</th>'+
                    '</tr>';
			for(i;i<numbersPerPage;i++){
				if(data[index+i]){
					html+='<tr>'+
			    			'<td>'+data[index+i].type+'</td>'+
			    			'<td>+'+data[index+i].integral+'</td>'+
			    			'<td>'+data[index+i].createTime+'</td>'+
			    		'</tr>';
				}
			}
			return (thead+html);
		}
		$('#sign-points').click(function(){
			var signBtn=$(this);
			//检查是否可以签到
			if($(this).hasClass('hasSigned')){
				alert('今日已签到。',1)
				return;
			}
			loginTEST(function(){
				var params=$.extend({},publicParams,{
					url:domain+paths.canSignPoints,
					data:{ssid:ssid},
					success:function(data){
						data=$.parseJSON(data);

						requestCallBack(data,function(){
							//签到
							loginTEST(function(){
								var params=$.extend({},publicParams,{
									url:domain+paths.signPoints,
									data:{ssid:ssid},
									success:function(data){
										data=$.parseJSON(data);
										console.dir(data);

										requestCallBack(data,function(){
											alert('签到成功！',1);
											signBtn.text('已签到').addClass('hasSigned');
											pointsQuery()
										})
									}
								})
								$.ajax(params);
							})
						})
						
					}
				})
				$.ajax(params);
			})


		})
		methodObj.pointsQuery=pointsQuery;


		/*==我的关注==*/
		//模板
		var favourTpls={
				favourTpl0:document.getElementById('favourTpl0').innerHTML,
				favourTpl1:document.getElementById('favourTpl3').innerHTML,
				favourTpl2:document.getElementById('favourTpl3').innerHTML,
				favourTpl3:document.getElementById('favourTpl3').innerHTML
			},
			favourQueryCount=0,
			favNavTabs=$('#ypt-user-favour ul'),
			totalCounts=$('li',favNavTabs).length;
		//请求
		function favourQuery(type){
			loginTEST(function(){
				var params=$.extend({},publicParams,{
					url:domain+paths.favour1,
					data:{
						ssid:ssid,
						type:String(type),
						param:{
							page:'',
							rows:''
						}
					},
					success:function(data){
						data=$.parseJSON(data);
						console.dir(data);

						requestCallBack(data,function(){
							$('#favour-count').html(data.data.length);
							insertFavour(data.data,$('#ypt-user-favour .tab-pane').eq(type));
						})

					}
				})

				$.ajax(params);
			})
		}
		//填充
		function insertFavour(data,favourWrap){
			var wrap=$('.contentWrap',favourWrap);
			if(data.length){
				var pages=$('.listPages',favourWrap);
				pages.data('page',{
					numbersPerPage:9,
					pagesPerLine:5,
					data:data,
					len:data.length,
					contentWrap:wrap,
					pagesWrap:pages,
					getHtml:getFavourHtml
				});
				getPages(0,pages);
			}else{
				wrap.html(noDataStr);
			}
		}
		function getFavourHtml(index,numbersPerPage,data){
			var i=0,html='',tpl;
			var type=$('li.active',favNavTabs).find('a').attr('type');

			var thead='<table class="table"><tr>'+
                        '<th style="width: 15%">时间</th>'+
                        '<th style="width: 35%">名称</th>'+
                        '<th style="width: 35%">内容</th>'+
                        '<th style="width: 15%">操作</th>'+
                    '</tr>';

			for(i;i<numbersPerPage;i++){
				tpl=favourTpls['favourTpl'+type]
				if(data[index+i]){
					$.each(data[index+i],function(k,v){
						if(k=='url'){
							v=domain+v;
						}else if(k=='imagePath'){
							v=v?v:'../img/poster3.png';
						}

						if(k=='createTime' && (type=='1' || type=='2' || type=='3')){
							// var d=new Date(Number(v))
							v=v.substr(0,10);
						}
						tpl=tpl.replace( (new RegExp('{'+k+'}','g')) ,v);
					})
					// tpl=tpl.replace('{proId2}',data[i].proId);
					html+=tpl;
				}
			}
			if(type=='1' || type=='2' || type=='3'){
				html=thead+html+'</table>';
			}

			return html;
		}
		//按类型查询
		favNavTabs
		.on('click','li',function(){
			favourQuery(Number($('a',this).attr('type')))
		})
		//我的关注
		$('#ypt-user-favour')
		.on('mouseover','.favour-item',function(){
			$(this).addClass('favour-item-over')
		})
		.on('mouseout','.favour-item',function(){
			$(this).removeClass('favour-item-over')
		})
		//取消关注
		.on('click','.favour-cancel',function(e){
			e.preventDefault();
			e.stopPropagation();

			var type=$(this).parents('.tab-pane').attr('type'),
				proId=$(this).attr('proId');

			loginTEST(function(){
				var params=$.extend({},publicParams,{
					url:domain+paths.delFav,
					data:{
						ssid:ssid,
						type:type,
						proId:proId
					},
					success:function(data){
						data=$.parseJSON(data);
						alert('已取消！');
						favourQuery(type);
					}
				})
				$.ajax(params);	
			})
		})
		methodObj.favourQuery=function(){
			favourQuery($('li.active',favNavTabs).find('a').attr('type'))
		}

		/*==我的观看==*/
		//模板
		var watchTpl=document.getElementById('watchTpl').innerHTML,
			watchNavTabs=$('#ypt-user-watch ul');
		//请求
		function watchQuery(type){
			loginTEST(function(){
				var params=$.extend({},publicParams,{
					url:domain+paths.watchList,
					data:{
						ssid:ssid,
						type:String(type),
						param:{
							page:'',
							rows:''
						}
					},
					success:function(data){
						data=$.parseJSON(data);
						console.dir(data);

						requestCallBack(data,function(){
							var index=$('li',watchNavTabs).index($('li.active',watchNavTabs));
							insertWatch(data.data,watchTpl,$('#ypt-user-watch .tab-pane').eq(index));
						});
					}
				})

				$.ajax(params);
			})
		}
		//填充
		function insertWatch(data,otpl,wrap){
			var i=0,len=data.length,html='',tpl=otpl;
			if(data.length){
				for(i;i<len;i++){
					$.each(data[i],function(k,v){
						if(k=='url'||k=='imagePath')v=domain+v;
						if(k=='status'){v=data[i].type=='0'?'已观看':'待观看'}
						tpl=tpl.replace('{'+k+'}',v);
					})
					html+=tpl;
					tpl=otpl;
				}
				if(type=='2' || type=='3'){
					html=thead+html;
				}
			}else{
				html=noDataStr;
			}

			wrap.html(html);
		}
		//按类型查询
		watchNavTabs
		.on('click','li',function(){
			watchQuery(Number($('a',this).attr('type')))
		})
		methodObj.watchedList=function(){
			watchQuery($('li.active',watchNavTabs).find('a').attr('type'))
		}

		/*==收货地址==*/
		//模板
		var orderHeadHtml='<tr>'+
			    			'<th class="adr-name">收货人</th>'+
			    			'<th class="adr-area">地区</th>'+
			    			'<th class="adr-detail">详细地址</th>'+
			    			'<th class="adr-phone">电话/手机</th>'+
			    			'<th class="adr-btns">操作</th>'+
			    		'</tr>';
		//请求
		function queryAdrList(edit){
			getArea($('#area-province1'));
			loginTEST(function(){
				var params=$.extend({},publicParams,{
					url:domain+paths.adrList,
					data:{ssid:ssid},
					success:function(data){
						data=$.parseJSON(data);
						console.dir(data);

						requestCallBack(data,function(){
							insertAdrData(data.data);
							if(edit){
								alert('编辑成功！');
							}
						})
					}
				})
				$.ajax(params);
			})
		}
		//填充
		function insertAdrData(data){
			var i=0,len=data.length,html='',defaultAdr;
			var wrap=$('#ypt-user-address table');

			if(data.length){
				var pages=$('#ypt-user-address .listPages');
				pages.data('page',{
					numbersPerPage:5,
					pagesPerLine:5,
					data:data,
					len:data.length,
					contentWrap:wrap,
					pagesWrap:pages,
					getHtml:function(index,numbersPerPage,data){
						var defaultAdr,html='',obj;

						for(var i=0;i<numbersPerPage;i++){
							obj=data[index+i];
							if(obj){
								defaultAdr=Number(obj.state)?'<a class="ypt-fc-red adr-default">默认地址</a>':'';
								html+='<tr><td class="adr-name">'+obj.name+'</td>'+
						    			'<td class="adr-province">'+obj.province+'</td>'+
						    			'<td class="adr-detail">'+obj.detail+'</td>'+
						    			'<td class="adr-phone">'+obj.phone+'</td>'+
						    			'<td class="adr-btns">'+defaultAdr+
						    				'<a id="'+obj.id+'" class="edit-adr">编辑</a>'+
						    				'<a id="'+obj.id+'" class="delete-adr">删除</a>'+
						    			'</td></tr>';
							}
						}

						return orderHeadHtml+html;
					}
				});
				getPages(0,pages);
			}else{
				wrap.html(orderHeadHtml+'<td colspan="5" style="padding:10px;text-align:center">未查询到任何数据</td>');
			}
			
			
		}
		//增加地址
		$('#addAdr').click(function(e){
			e.preventDefault();
			e.stopPropagation();

			var adrName=$('#adr-name').val(),
				adrPhone=$('#adr-phone').val(),
				adrDetail=$('#adr-detail').val();

			if(!adrName){
				showCheckWarn($('#adr-name'))
				return;
			}else{
				removeWarn($('#adr-name'))
			}

			if(!adrDetail){
				showCheckWarn($('#adr-detail'))
				return;
			}else{
				removeWarn($('#adr-detail'))
			}

			if(!regExps.phone.test(adrPhone)){
				showCheckWarn($('#adr-phone'));
				return;
			}else{
				removeWarn($('#adr-phone'))
			}

			$('#address-add-form .check-warn').html('');
			var areaInfo=$('#area-province1 option:selected').text()+
						$('#area-city1 option:selected').text()+
						$('#area-district1 option:selected').text();

			loginTEST(function(){
				var params=$.extend({},publicParams,{
					url:domain+paths.addAdr,
					data:{
						ssid:ssid,
						name:adrName,
						phone:adrPhone,
						province:areaInfo,
						detail:adrDetail,
						state:$('#adr-state').prop('checked')?'1':'0'
					},
					success:function(data){
						data=$.parseJSON(data);
						requestCallBack(data,function(){
							alert('添加成功！')

							queryAdrList();
							$('#adr-name').val('');
							$('#adr-detail').val('');
							$('#adr-phone').val('');
							$('#adr-state').prop('checked',true);
						})

					}
				})
				$.ajax(params);
			})
		})
		$('#ypt-user-address')
		//编辑地址
		.on('click','.edit-adr',function(){
			var id=$(this).attr('id'),
				tr=$(this).parent().parent(),
				form=$('#edit-form');

			$('#adr-name2',form).val($('.adr-name',tr).text());
			$('#adr-detail2',form).val($('.adr-detail',tr).text())
			$('#adr-phone2',form).val($('.adr-phone',tr).text())
			$('#adr-state2',form).prop('checked',$('.adr-default',tr).length?true:false);
			$('#edit-submit').attr('dId',id);

			var ele=$('#area-province2');
			areaInsert(ele,chinaAreaData.province,function(){
				ele.trigger('change')
			})
			form.modal('show');
		})
		//删除地址
		.on('click','.delete-adr',function(){
			var id=$(this).attr('id');
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
						alert('已删除！');
						queryAdrList();
					}
				})
				$.ajax(params);
			})
		})
		//提交编辑
		$('#edit-submit').click(function(e){
			e.preventDefault();
			e.stopPropagation();

			var adrName=$('#adr-name2').val(),
				adrPhone=$('#adr-phone2').val(),
				adrDetail=$('#adr-detail2').val();

			if(!adrName){
				showCheckWarn($('#adr-name2'))
				return;
			}else{
				removeWarn($('#adr-name2'))
			}

			if(!adrDetail){
				showCheckWarn($('#adr-detail2'))
				return;
			}else{
				removeWarn($('#adr-detail2'))
			}

			if(!regExps.phone.test(adrPhone)){
				showCheckWarn($('#adr-phone2'),'请输入有效的手机号码');
				return;
			}else{
				removeWarn($('#adr-phone2'))
			}

			$('#address-edit-form .check-warn').html('').hide();

			var form=$('#edit-form'),
				id=$(this).attr('dId');

			var areaInfo=$('#area-province2 option:selected').text()+
						$('#area-city2 option:selected').text()+
						$('#area-district2 option:selected').text();

			loginTEST(function(){
				var params=$.extend({},publicParams,{
					url:domain+paths.updateAdr,
					data:{
						ssid:ssid,
						name:adrName,
						phone:adrPhone,
						detail:adrDetail,
						province:areaInfo,
						state:$('#adr-state2',form).prop('checked')?'1':'0',
						id:id
					},
					success:function(data){
						data=$.parseJSON(data);
						console.dir(data);
						form.modal('hide');
						queryAdrList(1);
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

			var cityArea,disArea;
			if(id=='area-province1'){
				cityArea=$('#area-city1');
			}else if(id=='area-province2'){
				cityArea=$('#area-city2');
			}else if(id=='area-city1'){
				disArea=$('#area-district1');
			}else{
				disArea=$('#area-district2');
			}

			if(cityArea){
				$.each(chinaAreaData.city,function(){
					var _code=this.code;
					if(_code.substr(0,2)==code&&_code.length==4){
						cityData.push({code:_code,name:this.name})
					}
				})
				areaInsert(cityArea,cityData);
				cityArea.trigger('change');
			}

			if(disArea){
				$.each(chinaAreaData.district,function(){
					var _code=this.code;
					if(_code.substr(0,4)==code&&_code.length==6){
						cityData.push({code:_code,name:this.name})
					}
				})
				areaInsert(disArea,cityData)
			}

		})
		//获取省市区
		function getArea(ele){
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

				areaInsert(ele,chinaAreaData.province,function(){
					ele.trigger('change')
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
		methodObj.queryAdrList=queryAdrList;

		/*==个人信息==*/
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
		//请求
		function getUserInfo(){
			loginTEST(function(info){
				var bArr=info.birth.split('-');
				$('#birth-y').val(bArr[0]);
				$('#birth-m').val(Number(bArr[1])).trigger('change');
				$('#birth-d').val(Number(bArr[2]));
				//姓名性别
				$('#name').val(info.name);
				$('.sexRadio').each(function(){
					if($(this).attr('value')==info.userSex){
						$(this).prop('checked',true)
					}else{
						$(this).prop('checked',false)
					}
				})
			})
		}
		//修改
		$('#mod-info').click(function(e){
			e.preventDefault();
			e.stopPropagation();

			var name=$('#name').val();
			if(!name){
				showCheckWarn($('#name'));
				return;
			}
			removeWarn($('#name'));

			loginTEST(function(){
				var m=$('#birth-m').val(),
					d=$('#birth-d').val(),
					_m=m<10? '0'+m:m,
					_d=d<10? '0'+d:d;

				var userSex;
				$('.sexRadio').each(function(){
					if($(this).prop('checked')){
						userSex=$(this).attr('value')
					}
				})

				var params=$.extend({},publicParams,{
					url:domain+paths.changeInfo,
					data:{
						ssid:ssid,
						name:name,
						birth:$('#birth-y').val()+'-'+_m+'-'+_d,
						userSex:userSex
					},
					success:function(data){
						data=$.parseJSON(data);
						console.dir(data);

						alert('修改成功！')
					}
				})
				$.ajax(params);
			})
		});
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

            	$('#chooseHeadImg td').removeClass('chosen-img');
            	$('.userHeadImageSet img').attr('src',e.target.result);
            	$('#headImgPreview img').attr('src',e.target.result)

            }
		});
		//选择
		$('#chooseHeadImg td').click(function(){
			var img=$('img',this),
				src=img.attr('src');
			$('#chooseHeadImg td').removeClass('chosen-img');
			$(this).addClass('chosen-img');
			$('.userHeadImageSet img').attr('src',src);
			$('#headImgPreview img').attr('src',src);

			// getBase64(src);
		})
		//取消
		$('#upload-cancel').click(function(){
			$('#chooseHeadImg td').removeClass('chosen-img');
			headImageSrc || (headImageSrc='../img/headImgDefault.jpg');
			$('.userHeadImageSet img').attr('src',headImageSrc);
			$('#headImgPreview img').attr('src',headImageSrc)
		})
		//上传
		$('#upload-img').click(function(){
			if($('#chooseHeadImg .chosen-img').length){
				var srcArr=$('.chosen-img img').attr('src').split('/');
				loginTEST(function(){
					var params=$.extend({},publicParams,{
						url:domain+paths.changeHeadImg2,
						data:{
							ssid:ssid,
							// filePath:$('.chosen-img img').attr('src').replace('..',location.origin)
							filePath:srcArr[srcArr.length-1]
						},
						success:function(data){
							alert('上传成功！');
							data=$.parseJSON(data);
							console.dir(data);

							// insertComment(data.data);
						}
					})
					$.ajax(params);
				})
			}else{
				var form=new FormData($('#uploadForm')[0]);
				form.append('ssid',ssid);
				loginTEST(function(){
					var params=$.extend({},publicParams,{
						url:domain+paths.changeHeadImg,
						data:form,
						processData:false,
						contentType:false,
						success:function(data){
							alert('上传成功！');
							data=$.parseJSON(data);
							console.dir(data);

							// insertComment(data.data);
						}
					})
					$.ajax(params);
				})
			}
		})
		methodObj.getUserInfo=getUserInfo;


		/*==我的评论==*/
		//模板
		var comentTpl=document.getElementById('comentTpl').innerHTML;
		//请求
		function getComments(state){
			loginTEST(function(){
				var params=$.extend({},publicParams,{
					url:domain+paths.comments,
					data:{
						ssid:ssid,
						state:state,
						param:{page:'',rows:''}
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
			var wrap=$('.ypt-user-comments-item.active table');
			var pages=$('.ypt-user-comments-item.active .listPages');
			var state=$('#ypt-user-comments-list li.active').attr('state');

			if(data.length){
				pages
				.show()
				.data('page',{
					numbersPerPage:9,
					pagesPerLine:5,
					data:data,
					len:data.length,
					contentWrap:wrap,
					pagesWrap:pages,
					getHtml:function(index,numbersPerPage,data){
						var tpl,html='';
						for(var i=0;i<numbersPerPage;i++){
							tpl=comentTpl;
							if(data[index+i]){
								$.each(data[index+i],function(k,v){
									if(k=='id'){
										v='performInfo.html?id='+v;
									}
									if(k=='representPathUrl'){
										v=v? domain+v:'../img/demo.jpg';
									}
									tpl=tpl.replace((new RegExp('{'+k+'}','g')),v);
								})

								if(state=='1'){
									tpl=tpl.replace('{className1}','').replace('{className2}','show').replace('{content}','暂无评论')

								}else{
									tpl=tpl.replace('{className1}','show').replace('{className2}','')
								}
								tpl=tpl.replace('{cId}',data[index+i].id);
								html+=tpl;
							}
						}
						return html;
					}
				});
				getPages(0,pages);
			}else{
				wrap.html(noDataStr);
				pages.hide();
			}
			// $('#mark-count').html(data.length);	
		}
		//按类型
		$('#ypt-user-comments-list').on('click','li',function(){
			var state=$(this).attr('state');
			getComments(state);
		})
		methodObj.getComments=function(){
			getComments($('#ypt-user-comments-list li.active').attr('state'));
		};
		//去评价
		$('.ypt-user-comments-item').on('click','.go-comment',function(){
			var id=$(this).attr('cId');
			var oid=$(this).attr('oid');
			var startTime=$(this).attr('startTime');
			var name=$(this).attr('name');
			var tr=$(this).parents('tr');

			$('.comment-order img').attr('src',tr.find('img').attr('src'))
			$('#comment-submit').attr('pid',id).attr('oid',oid).data('from',$(this));
			$('#comment-content').val('');
			$('#comment-title').html(name);
			$('#comment-date span').html(startTime)
			$('#comment-form').modal('show');
		})

		/*==意见建议==*/
		$('#idea-submit').click(function(e){
			e.preventDefault();
			e.stopPropagation();
			// function queryAdrList(edit){
				loginTEST(function(){
					var params=$.extend({},publicParams,{
						url:domain+paths.ideaSubmit,
						data:{
							ssid:ssid,
							content:$('#idea-content').val()
						},
						success:function(data){
							data=$.parseJSON(data);
							console.dir(data);

							alert('提交成功！')
							$('#idea-content').val('')
						}
					})
					$.ajax(params);
				})
			// }
		})
		methodObj.ideaSubmit=function(){
			$('#idea-content').val('');
		};

		
		//初始化加载
		(function(){

			//是否有跳转
			var key=getQueryString("key");
			if(key){

				$('.buy-card').trigger('click');
				menus.removeClass('active');
				menus.eq(1).addClass('active');
				contents.removeClass('active');
				contents.eq(1).addClass('active');

			}else{
				//默认首先加载订单
				menus.eq(0).trigger('click');
			}
			//检查是否可以签到
			loginTEST(function(data){
				$('.user-name').text(data.name);
				var imgSrc=data.userHeadImage? domain+data.userHeadImage:'../img/login_user.png';
					headImageSrc=imgSrc;
				$('.userHeadImage img').attr('src',imgSrc);

				$('#uploadForm').attr('action',domain+paths.changeHeadImg);

				var params=$.extend({},publicParams,{
					url:domain+paths.canSignPoints,
					data:{ssid:ssid},
					success:function(data){
						data=$.parseJSON(data);
						if(data.statusCode!='200'){
							$('#sign-points').html('已签到').addClass('hasSigned')
						}
						
					}
				})
				$.ajax(params);
			})

		})();


	});

})();





