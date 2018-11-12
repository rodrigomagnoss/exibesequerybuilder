//var query = "(URLCONTEM(pg=5000)#e#(NAOURLCONTEM(tax=1200)#ou#(URLCONTEM(idConteudo=300)))#ou#(USUARIO(conhecido))#ou#(URLCONTEM(meuid=teste)"
var query = ""

var regras =  [
                    { name: 'URLCONTEM' },
                    { name: 'NAOURLCONTEM' },
                    { name: 'USUARIO' },
                    { name: 'GRUPO' }
                ];

var app = angular.module('app', ['ngSanitize', 'queryBuilder']);

app.controller('QueryBuilderCtrl', ['$scope', function ($scope) {
    var data = '{"group": {"operator": "","rules": []}}';

    function htmlEntities(str) {
        return String(str).replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    function computed(group) {
        if (!group) return "";
		var grpCondicao = group.operator == "E" ? "#e#" : "";
        for (var str = grpCondicao + "(", i = 0; i < group.rules.length; i++) {
			var condicao = group.rules[i].condicao;// == "E" ? "#e#" : group.rules[i].condicao == "OU" ? "#ou#" : "" ;
			var condition = group.rules[i].condition;// == "=" ? "" : "";
			//condition = condition == "E" ? "" : "";
            i > 0 && (str += "" + group.operator + "");
            str += group.rules[i].group ?
                computed(group.rules[i].group) :
                group.rules[i].field + "(" + condition + group.rules[i].data + ")" + htmlEntities(condicao || "");
        }

		//str = str.replace("OU", "");
		//str = str.replace("E", "");
        return str + ")";
    }

    $scope.json = null;

    $scope.filter = JSON.parse(data);

    $scope.$watch('filter', function (newValue) {
        $scope.json = JSON.stringify(newValue, null, 2);
        $scope.output = computed(newValue.group);
    }, true);
}]);

var queryBuilder = angular.module('queryBuilder', []);
queryBuilder.directive('queryBuilder', ['$compile', function ($compile) {
    return {
        restrict: 'E',
        scope: {
            group: '='
        },
        templateUrl: '/queryBuilderDirective.html',
        compile: function (element, attrs) {
            var content, directive;
            content = element.contents().remove();
            return function (scope, element, attrs) {
                scope.operators = [
                    { name: 'E' },
                    { name: 'OU' }
                ];

                scope.fields = regras;

                scope.conditions = [
                    { name: '' },
                    { name: 'pg=' },
                    { name: 'app=' },
                    { name: 'tax=' },
                    { name: 'idConteudo=' },
                    { name: 'anonimo' },
                    { name: 'conhecido' },
                    { name: 'grupos=' }
                ];

                scope.addCondition = function () {
                    scope.group.rules.push({
                        condicao: '',
                        condition: '',
                        field: '',
                        data: ''
                    });
                };

                scope.removeCondition = function (index) {
                    scope.group.rules.splice(index, 1);
                };

                scope.addGroup = function () {
                    scope.group.rules.push({
                        group: {
                            operator: '',
                            rules: []
                        }
                    });
                };

                scope.removeGroup = function () {
                    "group" in scope.$parent && scope.$parent.group.rules.splice(scope.$parent.$index, 1);
                };

                directive || (directive = $compile(content));

                element.append(directive(scope, function ($compile) {
                    return $compile;
                }));
            }
        }
    }
}]);

var initQuery = function (query) {
	var linhaTermo	 = -1;
	var linhaGrupo	 = -1;
	getQueryTermo(query, linhaTermo, linhaGrupo);
}

function getQueryTermo(query, linhaTermo, linhaGrupo){
	var operadorE = "#e#";
	var operadorO = "#ou#";
	var operadorAnd = "&&";
	var operadorOr = "||";
	var operador = "";
	var arrayTermo = "";
	//var arrayTermoE = query.indexOf(")"+operadorE) >= 0 ? query.split(operadorE) : "";
	//var arrayTermoO = arrayTermoE == "" ? query.split(")"+operadorO) : "";
	//arrayTermo = arrayTermoE != "" ? arrayTermoE : arrayTermoO;
//	arrayTermo = query.split(/(?=[#e#])(?=[#ou#]).*?(?![#e#])(?![#ou#])/) ;
	arrayTermo = query.replaceAll(operadorE,"&&").replaceAll(operadorO,"||").split(/(\)&&\(|\)\)\|\|)/) ;
	if(arrayTermo && arrayTermo.length < 2){
		arrayTermo = query.replaceAll(operadorE,"&&").replaceAll(operadorO,"||").split(/(\)&&\(|\)\|\|)/) ;
	}
//	arrayTermo = query.split(/(?=[#e#])(?=[#ou#]).*/) ;
	

	//operador = arrayTermoE != "" ? operadorE : operadorO;
	linhaTermo++;
	linhaGrupo++;
	if(arrayTermo && arrayTermo.length > 0){
		var indR = 0;
		var ajustaGrupo = 0;
		while(indR < arrayTermo.length){
			var umTermo = arrayTermo[indR];
			indR++
			var aumentarLinha = false;
			if(umTermo.length >= 8 && (umTermo.indexOf(operadorAnd) >= 0 || umTermo.indexOf(operadorOr) >= 0)){
				novoGrupo($(".btn-novo-grupo.linha-"+linhaGrupo+".grupo-"+linhaGrupo),linhaTermo);
				getQueryTermo(umTermo,linhaGrupo,linhaGrupo);
				ajustaGrupo = 1;
			}else if(umTermo.indexOf("&&") >= 0){
				if(indR < arrayTermo.length){
					$(".operadores:last", ".linha-"+(linhaTermo+ajustaGrupo)+".grupo-"+(linhaGrupo+ajustaGrupo)).val(operadorE).change();
					aumentarLinha = true;
				}
			}else if(umTermo.indexOf("||") >= 0){
				if(indR < arrayTermo.length){
					$(".operadores:last", ".linha-"+(linhaTermo+ajustaGrupo)+".grupo-"+(linhaGrupo+ajustaGrupo)).val(operadorO).change();
					aumentarLinha = true;
				}
			}else{
				novoTermo($(".btn-novo-termo.linha-"+linhaGrupo+".grupo-"+linhaGrupo+":first"),linhaTermo);
				var regra = getRegra(umTermo,linhaTermo, linhaGrupo);
				umTermo = umTermo.replace(regra.text,"");
				regra.selected = true;
				$(regra).change();
				var cond = getCondicaoFixa(umTermo,linhaTermo,linhaGrupo);
				umTermo = umTermo.replace(cond.text,"");
				cond.selected = true;
				$(cond).change();
				umTermo = umTermo.replaceAll("(","").replaceAll(")","");
				$(".cond-livre:last", ".linha-"+linhaTermo).val(umTermo).change();
			}
			if(aumentarLinha){
				if(ajustaGrupo == 0){
					linhaTermo++;
				}else{
					ajustaGrupo = 0;
				}
			}
		};
	
	}

}

function novoTermo($termo, linha){
	$termo.click();
	$termo.parent().next().addClass("linha-"+linha).addClass("grupo-"+linha);
}

function novoGrupo($grupo, linha){
	$grupo.click();
	$grupo.parent().next().children().find(".btn-novo-termo").addClass("linha-"+linha).addClass("grupo-"+linha);
	$grupo.parent().next().children().find(".btn-novo-grupo").addClass("linha-"+linha).addClass("grupo-"+linha);
}

function getRegra(termo,linhaTermo, linhaGrupo){
	var $regras = $(".regras:last", ".linha-"+linhaTermo+".grupo-"+linhaGrupo)
	var regra = "";
	var indR = $regras[0].options.length - 1;
	while(indR > 0){
		regra = $regras[0].options[indR];
		if(termo.indexOf(regra.text) >= 0 && termo){
			return regra;
//			indR = 0;
		}
		indR--;
	};
	return "";
}

function getCondicaoFixa(termo,linhaTermo, linhaGrupo){
	var $cond = $(".cond-fixa:last", ".linha-"+linhaTermo+".grupo-"+linhaGrupo)
	var cond = "";
	var indC = 1
	while(indC < $cond[0].options.length){
		cond = $cond[0].options[indC];
		if(termo.indexOf(cond.text) >= 0){
			//indC = $cond[0].options.length;	
			return cond;
		}
		indC++;
	};
	return "";
}

String.prototype.replaceAll = function(de, para){
    var str = this;
    var pos = str.indexOf(de);
    while (pos > -1){
		str = str.replace(de, para);
		pos = str.indexOf(de);
	}
    return (str);
}
