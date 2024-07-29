# equation-route-solver

Autorouting solvers that solve for equations of the form `y = f(x)` where `f` is a polynomial or a Bézier curve.

Run `npm run start` to see different equations and solutions.

## Concept and Motivation

Grid-based autorouting algorithms increase in complexity as size of the grid
increases. For example, if you want each cell to be `0.1mm x 0.1mm`, then representing
a `100mm x 100mm` grid would require `1,000 x 1,000` cells. This can be memory and
CPU intensive.

In general, grid-based autorouting scales in complexity as a function of the
area of the grid, not the number of obstacles or difficulty of the trace.

Equation-based route solvers scale in complexity as a function of the number of
obstacles and the difficulty of the trace.

## Equations

All equations take the form `y = f(x) ` where `f` is some function with a numerical
solver.

### Polynomial Equations

For polynomial equations, a least-squares solver is used to avoid "obstacle points". Intersections are solved for using the Newton-Raphson method.

These equations take the form:

$$y = a_0 + a_1x + a_2x^2 + ...$$

### Fourier Series Equations

For Fourier series equations, a least-squares solver is used to avoid "obstacle points" and a fast fouriter transform method is used to solve for intersections.

These equations take the form:

$$y = a_0 + a_1cos(x) + a_2sin(x) + a_3cos(2x) + ...$$

## Single-iteration vs Multi-iteration Equation Solvers

A single-iteration equation solver will convert all obstacles into data points
that can be used to solve for the equation.

A multi-iteration equation solver will attempt to use the equation `y=0` (degree 0). It will then solve for intersections. If no intersections are found, it will try solve for

$$f_1(x)$$

Where `f_1` is the first degree form of the equation, e.g. for the polynomial equation...

$$f_1(x) = a_0$$

It should solve using using each intersecting point as a negative cost point.

After the weights are calculated, you find new intersection points and repeat
the process, increasing the degree of the equation by 1 until there are no
intersections.
