	// var numbersPerPage=10,
	// 	pagesPerLine=5,
	// 	data=chinaArea,
	// 	len=data.length,
	// 	contentWrap=$('#content'),
	// 	pagesWrap=$('#pages-wrap');

	function getPages(page,ele){
		page=page || 0;
		var obj=ele.data('page');
		var numbersPerPage=obj.numbersPerPage;
		var pagesPerLine=obj.pagesPerLine;
		var pagesWrap=obj.pagesWrap;
		var len=obj.len;

		var pLen=len-page*numbersPerPage;
		var pInt=parseInt(pLen/numbersPerPage);
		var leftPages=pLen%numbersPerPage? pInt+1:pInt;

		if(pLen<=0)return;

		var html='';
		var count;
		var i=0;
		var pageNumber;
		var className;
		var andHtml;

		if(leftPages>pagesPerLine){
			count=pagesPerLine;
			andHtml='<a class="more">...</a>';
		}else{
			count=leftPages;
			andHtml='<a class="no-more"></a>';
		}

		for(i;i<count;i++){
			className='';
			if(!i){className='firstPage';}
			if(i+1==count){className='lastPage'}

			pageNumber=(page+i+1);
			html+='<a class="page '+className+'"">'+pageNumber+'</a>'
		}

		var tInt=parseInt(len/numbersPerPage);
		var tPages=len%numbersPerPage? tInt+1:tInt;

		var prev='<a class="prev">上一页</a>';
		var next='<a class="next">下一页</a>';
		var total='<span>共 '+tPages+' 页</span>'

		pagesWrap.html(prev+html+andHtml+next+total);

		if(!page){
			// $('a.page',pagesWrap).eq(0).trigger('click')
			(function(ele){
				if(!ele.hasClass('current')){
					$('.current',pagesWrap).removeClass('current');
					ele.addClass('current');
				}
				getDatas(ele)
			})($('a.page',pagesWrap).eq(0));
		}
	}

	function getDatas(ele,contentWrap){
		var obj=ele.parents('.listPages').data('page');
		var numbersPerPage=obj.numbersPerPage;
		var contentWrap=obj.contentWrap;

		var index=(Number(ele.html())-1)*numbersPerPage;
		var html='';

		if(obj.getHtml){
			html=obj.getHtml(index,numbersPerPage,obj.data);
		}
		// for(var i=0;i<numbersPerPage;i++){
		// 	if(data[index+i]){
		// 		html+='<li>'+data[index+i]+'</li>';
		// 	}
		// }
		contentWrap.html(html);
	}

	$(function(){
		$('.listPages').on('click','a',function(){
			var ele=$(this);
			var obj=$(this).parents('.listPages').data('page');

			var pagesWrap=obj.pagesWrap;
			var pagesPerLine=obj.pagesPerLine;

			//页数
			if(ele.hasClass('page')){
				if(!ele.hasClass('current')){
					$('.current',pagesWrap).removeClass('current');
					ele.addClass('current');
				}
				getDatas(ele)
			}
			//下一页
			else if($(this).hasClass('next')){
				var  curPage=$('.current',pagesWrap);
				if(curPage.hasClass('lastPage')){
					if(!$('.no-more',pagesWrap).length){
						getPages(Number(curPage.html()),pagesWrap);
						$('a.page',pagesWrap).eq(0).addClass('current');
						getDatas($('.current',pagesWrap).eq(0))
					}
				}else{
					curPage.removeClass('current');
					curPage.next().addClass('current');
					getDatas($('.current',pagesWrap).eq(0))
				}
			}
			//上一页
			else if($(this).hasClass('prev')){
				var  curPage=$('.current',pagesWrap);
				if(curPage.hasClass('firstPage') || (curPage.hasClass('lastPage') && $('a.page',pagesWrap).length==1) ){
					var _page=Number(curPage.html())-1-pagesPerLine;
					if(_page>=0){
						getPages(_page,pagesWrap);
						$('.current',pagesWrap).removeClass('current');
						getDatas($('a.page',pagesWrap).eq(pagesPerLine-1).addClass('current'));
					}
					
				}else{
					curPage.removeClass('current');
					curPage.prev().addClass('current');
					getDatas($('.current',pagesWrap).eq(0))
				}

			}
		})
	});