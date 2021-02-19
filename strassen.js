// minimal matrix size for Strassen algorithm
N_MIN = 128;

// check for positive integer
function check_pos_integer(N)
{
  return (Number.isInteger(N) && N>0);
}

// check matrix size
function check_size(A,N,M)
{
  if (A.length != N)
  {
    return false;
  }
  var i;
  for (i=0; i<A.length; i++)
  {
    if (A[i].length != M)
    {
      return false;
    }
  }
  return true;
}

// generate random matrix of size N x M
function random_matrix(N,M)
{
  console.assert(check_pos_integer(N) && check_pos_integer(M));

  var A = new Array(N);
  var i,j;
  for (i=0; i<N; i++)
  {
    A[i] = new Array(M);
    for (j=0; j<M; j++)
    {
      A[i][j] = Math.random();
    }
  }

  return A;
}


// return A + s*B, s is scalar
function matrix_sadd(A,s,B)
{
  var N = A.length;
  console.assert(check_pos_integer(N));
  var M = A[0].length;
  console.assert(check_pos_integer(M));
  console.assert(check_size(A,N,M) && check_size(B,N,M));

  var C = new Array(N);
  var i,j;
  for (i=0; i<N; i++)
  {
    C[i] = new Array(M);
    for (j=0; j<M; j++)
    {
      C[i][j] = A[i][j] + s*B[i][j];
    }
  }
  return C;
}

// multiply two matrices
function matrix_mul(A,B)
{
  var N = A.length;
  var M = B.length;
  console.assert(check_pos_integer(N) && check_pos_integer(M));

  var K = B[0].length;
  console.assert(check_pos_integer(K));
  console.assert(check_size(A,N,M));
  console.assert(check_size(B,M,K));

  var i,j,l, Cij;

  var C = new Array(N);
  for (i=0; i<N; i++)
  {
    C[i] = new Array(K);
    for (j=0; j<K; j++)
    {
      Cij = 0.0;
      for (l=0; l<M; l++)
      {
        Cij += A[i][l]*B[l][j];
      }
      C[i][j] = Cij;
    }
  }
  return C;
}


// Strassen algorithm for matrix multiplication
function matrix_mul_strassen(A,B)
{
  var N = A.length;
  var M = B.length;
  console.assert(check_pos_integer(N) && check_pos_integer(M));

  var K = B[0].length;
  console.assert(check_pos_integer(K));
  console.assert(check_size(A,N,M));
  console.assert(check_size(B,M,K));

  console.assert((N==M) && (N==K));

  if ((N%2 != 0) || (N<=N_MIN))
  {
    return matrix_mul(A,B);
  }
  else
  {
    /* TODO: implement Strassen's algorithm */

    /* M1 = (A11 + A22)*(B11+B22) */
    /* M2 = (A21 + A22)*B11 */
    /* M3 = A11*(B12-B22) */
    /* M4 = A22*(B21-B11) */
    /* M5 = (A11 + A12)*B22 */
    /* M6 = (A21 - A11)*(B11+B12) */
    /* M7 = (A12 - A22)*(B21+B22) */
    /* C12 = M3+M5 */
    /* C21 = M2+M4 */
    /* C11 = M1+M4-M5+M7 */
    /* C22 = M1-M2+M3+M6 */

    if (A.length === 1) {
      return A[0] * B[0];
    }

    let a = [];
    for (let i = 0; i < A.length/2; i++) {
      a.push(A[i].slice(0, A[i].length/2));
    }
    let b = [];
    for (let i = A.length/2; i < A.length; i++) {
      b.push(A[i].slice(0, A[i].length/2));
    }
    let c = [];
    for (let i = 0; i < A.length/2; i++) {
      c.push(A[i].slice(A[i].length/2, A[i].length));
    }
    let d = [];
    for (let i = A.length/2; i < A.length; i++) {
      d.push(A[i].slice(A[i].length/2, A[i].length));
    }

    let e = [];
    for (let i = 0; i < B.length/2; i++) {
      e.push(B[i].slice(0, B[i].length/2));
    }
    let f = [];
    for (let i = B.length/2; i < B.length; i++) {
      f.push(B[i].slice(0, B[i].length/2));
    }
    let g = [];
    for (let i = 0; i < B.length/2; i++) {
      g.push(B[i].slice(B[i].length/2, B[i].length));
    }
    let h = [];
    for (let i = B.length/2; i < B.length; i++) {
      h.push(B[i].slice(B[i].length/2, B[i].length));
    }

    /*console.log("a");
    console.log(a);
    console.log("b");
    console.log(b);
    console.log("c");
    console.log(c);
    console.log("d");
    console.log(d);
    
    console.log("e");
    console.log(e);
    console.log("f");
    console.log(f);
    console.log("g");
    console.log(g);
    console.log("h");
    console.log(h);*/

    let p1 = matrix_mul_strassen(a, matrix_sadd(f, -1, h))   
    let p2 = matrix_mul_strassen(matrix_sadd(a, 1, b), h)         
    let p3 = matrix_mul_strassen(matrix_sadd(c, 1, d), e)         
    let p4 = matrix_mul_strassen(d, matrix_sadd(g,-1, e))         
    let p5 = matrix_mul_strassen(matrix_sadd(a, 1, d), matrix_sadd(e, 1, h))         
    let p6 = matrix_mul_strassen(matrix_sadd(b, -1, d), matrix_sadd(g, 1, h))   
    let p7 = matrix_mul_strassen(matrix_sadd(a, -1, c), matrix_sadd(e, 1, f))

    let c11 = matrix_sadd(matrix_sadd(p5, 1, p4), -1, matrix_sadd(p2, 1, p6))
    let c12 = matrix_sadd(p1, 1, p2);
    let c21 = matrix_sadd(p3, 1, p4)
    let c22 = matrix_sadd(matrix_sadd(matrix_sadd(p1, 1, p5), -1, p3), -1, p7);

    let C = [];

    for (let i = 0; i < c11.length; i++) {
      let temp = c11[i].concat(c21[i]);
      C.push(temp);
      let temp1 = c12[i].concat(c22[i]);
      C.push(temp1);
    }
  

    /*let M1 = (A[0][0] + A[1][1])*(B[0][0] + B[1][1]);
    let M2 = (A[1][0] + A[1][1])*B[0][0];
    let M3 = A[0][0]*(B[0][1] - B[1][1]);
    let M4 = A[1][1]*(B[1][0] - B[0][0]);
    let M5 = (A[0][0] + A[0][1])*B[1][1];
    let M6 = (A[1][0] - A[0][0])*(B[0][0]+B[0][1])
    let M7 = (A[0][1] - A[1][1])*(B[1][0]+B[1][1]);*/

    /*C[0][1] = M3+M5;
    C[1][0] = M2+M4;
    C[0][0] = M1+M4-M5+M7;
    C[1][1] = M1-M2+M3+M6;*/
    /*console.log(A);
    console.log(C.length);
    console.log(C);*/
    
    return C;
  }
}

/*function addMtx (A, B) {
  let C = new Array(a.length);
  for (let i = 0; i < A.length; i++) {
    C.push(new Array(A[i].length));
    for (let j = 0; j < A[i].length; j++) {
      C[i][j] = A[i][j] + B[i][j];
    }
  }

  return C;
}

function negateMtx (A, B) {
  let C = new Array(a.length);
  for (let i = 0; i < A.length; i++) {
    C.push(new Array(A[i].length));
    for (let j = 0; j < A[i].length; j++) {
      C[i][j] = A[i][j] - B[i][j];
    }
  }

  return C;
}*/

function strassen_test(N)
{
  var A = random_matrix(N,N);
  var B = random_matrix(N,N);

  var C1, C2;

  var diff = 0.0, i,j, t_naive, t_strassen;

  var t0 = process.hrtime.bigint();
  C1 = matrix_mul(A,B);
  var t1 = process.hrtime.bigint();
  C2 = matrix_mul_strassen(A,B);
  var t2 = process.hrtime.bigint();

  t_naive    = Number(t1-t0)*1.0E-09;
  t_strassen = Number(t2-t1)*1.0E-09;

  for (i=0; i<C1.length; i++)
  {
    for (j=0; j<C1[i].length; j++)
    {
      diff += Math.abs(C1[i][j]-C2[i][j]);
    }
  }
  diff = diff/(N*N);


  console.log("Size = ", N, " diff = ", diff, " Timing: naive = ", t_naive, " Strassen: ", t_strassen);
}


//A = random_matrix(4,2);
//console.log(A);
//B = random_matrix(2,3);
//console.log(B);
//C = matrix_mul(A,B);
//console.log(C);

var i;
for (i=0; i<12; ++i) strassen_test(2**i);