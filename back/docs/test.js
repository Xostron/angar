const arr = ['', '', 1, 2, 3, '', 4, 5, '']

function test1() {
	for (let i = 0; i < arr.length; i++) {
		console.log(i)
		if (typeof arr[i] === 'number') continue
		arr.splice(i, 1)
		if (i===0) i--
	}
}


test1()
console.log(arr, arr.length)
