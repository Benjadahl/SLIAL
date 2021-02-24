const math = require("mathjs");

const A = math.matrix([[1,  1/2, 1/3], 
                      [1/2, 1/3, 1/4],
                      [1/3, 1/4, 1/4]]);

eigenValue(A, math.matrix([[1],[1],[1]]), 1000);

function eigenValue (matrix, x0, iterations) {
  let xk = math.multiply(matrix, x0);
  console.log(xk);

  for (let i = 0; i < iterations; i++) {
    xk = math.multiply(matrix, xk)
  }

  let elem = xk._data[xk._size[0] - 1][0];

  xk = xk.map((value, index, matrix) => {
    return value / elem;
  });

  console.log(math.multiply(matrix, xk)._data[xk._size[0] - 1]);
}