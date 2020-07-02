function Part(name, name2, partsOrFlavour) {
	this.name = name;
	this.name2 = name2 || name;
	if (typeof partsOrFlavour == "string") {
		this.children = [];
		this.flavour = partsOrFlavour;
	} else {
		this.children = partsOrFlavour || [];
		this.flavour = null;
	}
}
var head = new Part("голова", "голову");
var rootParts = [
	head,
	new Part("гениталия", "гениталию", "Передайте соболзенования."),
	new Part("пупок", 0, "Не очень то и хотелось."),
	new Part("копчик", 0, "Теперь нельзя сидеть-пердеть."),
	new Part("сердце", 0, "The end."),
];
for (let стр of ["лев", "прав"]) {
	head.children.push(new Part(стр+"ое ухо", 0, "Это - не пирсинг. Это - жизнь."));
	head.children.push(new Part(стр+"ый глаз"));
	head.children.push(new Part(стр+"ая ноздря", стр+"ую ноздрю"));
	rootParts.push(new Part(стр+"ое полужопие"));
	rootParts.push(new Part(стр+"ая ключица", стр+"ую ключицу", [
		new Part(стр+"ая рука", стр+"ую руку", [
			new Part(стр+"ая ладонь", стр+"ую ладонь", [
				new Part("мизинец "+стр+"ой руки"),
			]),
		]),
	]));
	rootParts.push(new Part(стр+"ое бедро", null, [
		new Part(стр+"ое колено", null, [
			new Part(стр+"ая ступня", стр+"ую ступню", [
				new Part("мизинец "+стр+"ой ноги", null, "Тысяча чертей!"),
			]),
		]),
	]));
}
var allParts = [];
function addToAllParts(part) {
	allParts.push(part);
	for (let sub of part.children) addToAllParts(sub);
}
for (let part of rootParts) addToAllParts(part);

function shoot(part, дурак) {
	var found = [];
	function shootRec(part) {
		found.push(part.name);
		for (let sub of part.children) shootRec(sub);
	}
	shootRec(part);
	var out = `${дурак} попадает себе в ${part.name2}!`;
	if (found.length > 0) {
		if (found.length > 1) {
			out += ` Его ${found.join(", ")} теперь не работают.`;
		} else {
			out += ` Его ${found[0]} теперь не работает.`;
		}
	}
	if (part.flavour) out += " " + part.flavour;
	return out;
}

module.exports.shoot = (username) =>
{
    var part = allParts[Math.floor(Math.random() * allParts.length)];
    return shoot(part, username);
}