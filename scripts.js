//La valeur du token
var token = null;

//Contient l'ensemble des formulaires
var dataTable = [];

/**
 * callAjax
 *	Permet d'exécuter des requêtes AJAX
 * @param {object/null} actions	    =>  {
 *					    url: {string}			=> l'adresse URL de la requête AJAX
 *					    method: {string} GET/POST		=> la méthode de transmission des données
 *					    scriptFunction: {string/null}	=> permet de définir une fonction à appeler après l'exécution de la requête AJAX
 *					}
 * @param {object/null}		    => la liste des paramètres
 * 
 * @return {void}
 */
function callAjax(actions, params) {
    $.ajax({
	url: "https://www.kizeoforms.com/rest/v3/" + actions.url,
	method: actions.method,
	data: params,
	contentType: 'application/json',
	success: function (response) {
	    console.log(response);
	    if (actions.scriptFunction)
		window[actions.scriptFunction](response);
	},
	beforeSend: function (req) {
	    var tokenAux = getCookie("token") ? getCookie("token") : token;
	    req.setRequestHeader('Authorization', tokenAux);
	},
	error: function (data) {
	    console.log('Erreur callAjax');
	    console.log(data);
	}
    });
}

/**
 * Lors du clic sur le bouton "transmettre" on récupère le Token en fonction des identifiants
 */
$("#submit").click(function () {
    var valeurs = {
	user: $("#identifiant").val(),
	password: $("#mdp").val(),
	company: $("#code").val()
    };
    var valJson = JSON.stringify(valeurs);
    callAjax({
	url: "login",
	scriptFunction: "getToken",
	method: "POST"
    },
	    valJson
	    );
});

/**
 * getToken
 *	Est appelée après la récupération du Token
 *	
 * @param {object} params		=> le résultat du web service "login"
 * 
 * @return {void}
 */
function getToken(params) {
    token = params.data.token;
    setCookie("token", params.data.token, 3600);
}

/**
 * sortObject
 *	Permet de trier un objet en fonction d'un de ses paramètres
 * @param {object} tableau	=> l'objet à trier
 * @param {string} name		=> le nom d'un de ses paramètres
 * @param {string/null} sort	=> comment trier le tableau (ASC ou DESC)
 * 
 * @return {object}
 */
function sortObject(tableau, name, sort) {
    sort = (typeof sort == 'undefined') ? "ASC" : ((sort == "ASC" || sort == "DESC") ? sort : "ASC");
    var aux;
    for (var i = 0; i < tableau.length; i++) {
	for (var j = 0; j < tableau.length; j++) {
	    if (sort == "DESC") {
		if (i != j && tableau[i][name].toLowerCase() > tableau[j][name].toLowerCase()) {
		    aux = tableau[j];
		    tableau[j] = tableau[i];
		    tableau[i] = aux;
		}
	    } else {
		if (i != j && tableau[i][name].toLowerCase() < tableau[j][name].toLowerCase()) {
		    aux = tableau[i];
		    tableau[i] = tableau[j];
		    tableau[j] = aux;
		}
	    }
	}
    }

    return tableau;
}

/**
 * Permet de formater une date au format FR long
 * 
 * @return {string}
 */
Date.prototype.toLongFrenchFormat = function () {
    var months = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
    var date = this.getDate();
    if (date < 10) {
	date = "0" + date;
    }
    var output = date + " " + months[this.getMonth()] + " " + this.getFullYear() + " " + this.getHours() + ":" + this.getMinutes() + ":" + this.getSeconds();
    return output;
}

/**
 * formsAction
 *	Est appelée lors du clic sur le bouton "afficher forms"
 * 
 * @return {void}
 */
function formsAction() {
    callAjax({
	url: "forms",
	scriptFunction: "getForms",
	method: "GET"
    }, null);
}

/**
 * getForms
 *	Est appelée après la récupération des formulaires
 *	
 * @param {object} params	    => le résultat du web service "forms"
 * 
 * @return {void}
 */
function getForms(params) {
    dataTable = [];
    for (var i = 0; i < params.forms.length; i++)
	dataTable.push(params.forms[i]);

    displayForms(null, null);
}

/**
 * displayForms
 *	Affiche les formulaires
 *	
 * @param {string/null} name			=> pour trier le tableau de formulaire
 * @param {string/null} sort			=> la méthode de tri du tableau
 * 
 * @return {void}
 */
function displayForms(name, sort) {
    if (name)
	dataTable = sortObject(dataTable, name, sort);

    var dateForm;
    var html = "<table id=\"table_forms\"><thead><tr>";
    html += "<th onClick=\"displayForms('id', '" + ((sort === "ASC") ? "DESC" : "ASC") + "');\">ID</th>";
    html += "<th onClick=\"displayForms('name', '" + ((sort === "ASC") ? "DESC" : "ASC") + "');\">Nom</th>";
    html += "<th onClick=\"displayForms('class', '" + ((sort === "ASC") ? "DESC" : "ASC") + "');\">Class</th>";
    html += "<th onClick=\"displayForms('update_time', '" + ((sort === "ASC") ? "DESC" : "ASC") + "');\">Mis à jour</th>";
    html += "</tr></thead>";
    for (var i = 0; i < dataTable.length; i++) {
	dateForm = new Date(dataTable[i].update_time);

	html += "<tr onClick=\"openModal('#form-"+dataTable[i].id+"');\">";
	html += "<td>" + dataTable[i].id + "</td>";
	html += "<td>" + dataTable[i].name + "</td>";
	html += "<td>" + dataTable[i].class + "</td>";
	html += "<td>" + dateForm.toLongFrenchFormat() + "</td>";
	html += "</tr>";

	html += "<div id=\"form-" + dataTable[i].id + "\" style=\"display:none;\">";
	html += "<ul>";
	html += "<li>checkboxOutputFalseValue: " + dataTable[i].options.checkboxOutputFalseValue + "</li>";
	html += "<li>checkboxOutputTrueValue: " + dataTable[i].options.checkboxOutputTrueValue + "</li>";
	html += "<li>allUsersSeeHisto: " + dataTable[i].options.allUsersSeeHisto + "</li>";
	html += "<li>allUsersUpdateHisto: " + dataTable[i].options.allUsersUpdateHisto + "</li>";
	html += "<li>unallowedUsers: " + dataTable[i].options.unallowedUsers + "</li>";
	html += "<li>allowedUsers: " + dataTable[i].options.allowedUsers + "</li>";
	html += "</ul>";
	html += "<p>" + JSON.stringify(dataTable[i].options) + "</p></div>";
    }
    html += "</table>";
    $("#forms").html(html);
}

/**
 * openModal
 *	Affiche un modal en fonction de son ID
 * 
 * @param {type} name	    => l'ID du modal à ouvrir
 * 
 * @return {void}
 */
function openModal(name) {
    $(name).modal();
}

/*
 * getCookie
 *	Recherche et retourne la valeur d'un cookie
 * 
 * @param {string} name		=> le nom du cookie
 * 
 * @return {string/null}
 */
function getCookie(name) {
    var value = "; " + document.cookie;
    var parts = value.split("; " + name + "=");
    if (parts.length == 2)
	return parts.pop().split(";").shift();
    return null;
}

/*
 * setCookie
 *	Ecrit un cookie
 * 
 * @param {string} sName	=> le nom du cookie
 * @param {string} sValue	=> la valeur du cookie
 * @param {int} sDuration	=> la durée du cookie en seconde
 * @param {string} sLocation	=> l'endroit où stocker le cookie
 * 
 * @return {void}
 */
function setCookie(sName, sValue, sDuration, sLocation) {
    var sLocation = (typeof sLocation !== "undefined") ? sLocation : "/";
    var today = new Date(), expires = new Date();
    expires.setTime(today.getTime() + (sDuration * 1000));
    document.cookie = sName + "=" + encodeURIComponent(sValue) + ";expires=" + expires.toGMTString() + ";path=" + sLocation;
}

/*
 * removeCookie
 *	Supprime un cookie
 * 
 * @param {string} sName	    => le nom du cookie
 * @param {string} sLocation	    => l'endroit où est stocké le cookie
 * 
 * @return {void}
 */
function removeCookie(sName, sLocation) {
    var sLocation = (typeof sLocation !== "undefined") ? sLocation : "/";
    var today = new Date(), expires = new Date();
    expires.setTime(today.getTime() + (1000));
    document.cookie = sName + "=" + encodeURIComponent("") + ";expires=" + expires.toGMTString() + ";path=" + sLocation;
}