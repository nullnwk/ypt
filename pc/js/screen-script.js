$(document).ready(function(){
							
	$("#select1 dd").click(function () {
		$(this).addClass("selected").siblings().removeClass("selected");
		if ($(this).hasClass("select-all")) {
			$("#selectA").remove();
		} else {
			var copyThisA = $(this).clone();
			var content = $(this).text().replace("|","").trim();
			if ($("#selectA").length > 0) {
				$("#selectA a").html(content);
			} else {
				$(".select-result dl").append(copyThisA.attr("id", "selectA"));
			}
		}
		$(".select-result dl").find("span").text("");
	});
	
	$("#select2 dd").click(function () {
		alert($(this).attr("val"));
		$(this).addClass("selected").siblings().removeClass("selected");
		if ($(this).hasClass("select-all")) {
			$("#selectB").remove();
		} else {
			var copyThisB = $(this).clone();
			var content = $(this).text().replace("|","").trim();
			if ($("#selectB").length > 0) {
				$("#selectB a").html(content);
			} else {
				$(".select-result dl").append(copyThisB.attr("id", "selectB"));
			}
		}
		$(".select-result dl").find("span").text("");
	});
	
	$("#select3 dd").click(function () {
		$(this).addClass("selected").siblings().removeClass("selected");
		if ($(this).hasClass("select-all")) {
			$("#selectC").remove();
		} else {
			var copyThisC = $(this).clone();
			var content = $(this).text().replace("|","").trim();
			if ($("#selectC").length > 0) {
				$("#selectC a").html(content);
			} else {
				$(".select-result dl").append(copyThisC.attr("id", "selectC"));
			}
		}
		$(".select-result dl").find("span").text("");
	});

	$("#select4 dd").click(function () {
		$(this).addClass("selected").siblings().removeClass("selected");
		if ($(this).hasClass("select-all")) {
			$("#selectD").remove();
		} else {
			var copyThisD = $(this).clone();
			var content = $(this).text().replace("|","").trim();
			if ($("#selectD").length > 0) {
				$("#selectD a").html(content);
			} else {
				$(".select-result dl").append(copyThisD.attr("id", "selectD"));
			}
		}
		$(".select-result dl").find("span").text("");
	});
	$("#select5 dd").click(function () {
		$(this).addClass("selected").siblings().removeClass("selected");
		if ($(this).hasClass("select-all")) {
			$("#selectD").remove();
		} else {
			var copyThisD = $(this).clone();
			var content = $(this).text().replace("|","").trim();
			if ($("#selectE").length > 0) {
				$("#selectD a").html(content);
			} else {
				$(".select-result dl").append(copyThisD.attr("id", "selectE"));
			}
		}
		$(".select-result dl").find("span").text("");
	});
	
	$("#selectA").live("click", function () {
		$(this).remove();
		$("#select1 .select-all").addClass("selected").siblings().removeClass("selected");
	});
	
	$("#selectB").live("click", function () {
		$(this).remove();
		$("#select2 .select-all").addClass("selected").siblings().removeClass("selected");
	});
	
	$("#selectC").live("click", function () {
		$(this).remove();
		$("#select3 .select-all").addClass("selected").siblings().removeClass("selected");
	});

	$("#selectD").live("click", function () {
		$(this).remove();
		$("#select4 .select-all").addClass("selected").siblings().removeClass("selected");
	});

	$("#selectE").live("click", function () {
		$(this).remove();
		$("#select5 .select-all").addClass("selected").siblings().removeClass("selected");
	});
	
	$(".select dd").live("click", function () {
		if ($(".select-result dd").length > 1) {
			$(".select-no").hide();
		} else {
			$(".select-no").show();
		}
	});
});

//根据一级