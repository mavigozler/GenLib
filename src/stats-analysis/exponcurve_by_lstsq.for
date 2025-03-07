      SUBROUTINE EXPFIT(N, X, Y, W, IC, CV, P, RSS, Z, IFAULT)
C
C        ALGORITHM AS 212  APPL.STATIST. (1985) VOL.34, NO.2
C
C        FITS EXPONENTIAL CURVE  E(Y) = G0 + G1*(1-EXP(P*X))/P  USING
C        MODIFIED NEWTON ITERATIONS ON P AFTER ELIMINATING G0 AND G1
C
      REAL X(N), Y(N), W(N), Z(N), CV(4), P(3), RSS
      INTEGER IC(3)
      REAL EPS1, EPS2, EXPMAX, ZERO, ONE, TWO, HALF, FIVE, XMAXP, XMINP,
     *  XMAXO, XMINO, XLOC, STEPMX, POWMAX, SYY, POWNEW, YLOC, ZBAR,
     *  YBAR, SZZ, SZY, SW, BXCX0, BXCX1, BXCX2, D, ZDIF, YDIF, C, B1,
     *  B0, RSSNEW, RSSMAX, RSSMIN, POWMIN, DP, DPDP, D2ZDP2, ERR, WT,
     *  T, PLIM, PSTEP, DPDB0, DPDB1, XSC, DZDP
C
C        CONSTANTS   -   EXPMAX IS MACHINE DEPENDENT
C
      DATA EPS1 /1.0E-6/, EPS2 /1.0E-4/, MAXIT /20/, EXPMAX /300.0/
      DATA ZERO /0.0/, ONE /1.0/, TWO /2.0/, HALF /0.5/, FIVE /5.0/
C
C        CHECK FOR VALID PARAMETERS, FIND OVERALL MIN AND MAX OF X, ...
C
      NDIFX = 0
      IF (N .LE. 0) GOTO 30
      IFAULT = 5
      XMAXO = X(1)
      XMINO = XMAXO
      DO 20 I = 1, N
      IF (W(I) .LT. ZERO) RETURN
      XMAXO = AMAX1(X(I), XMAXO)
      XMINO = AMIN1(X(I), XMINO)
      IF (W(I) .EQ. ZERO) GOTO 20
C
C        ... ACCUMULATE MIN AND MAX WITH NON-ZERO WEIGHTS AND CHECK FOR
C        ENOUGH DISTINCT VALUES OF THIS TYPE
C
      IF (NDIFX .NE. 0) GOTO 10
      XMAXP = X(I)
      XMINP = XMAXP
      NDIFX = 1
      GOTO 20
   10 IF (X(I) .NE. XMINP .AND. X(I) .NE. XMAXP) NDIFX = NDIFX + 1
      XMAXP = AMAX1(X(I), XMAXP)
      XMINP = AMIN1(X(I), XMINP)
   20 CONTINUE
   30 IFAULT = 4
      NPAR = 3
      DO 40 I = 1, 3
      IF (IC(I) .NE. 0) NPAR = NPAR - 1
   40 CONTINUE
      IF (NDIFX .LT. MAX0(NPAR, 2)) RETURN
C
      STEPMX = FIVE / (XMAXP - XMINP)
      IF (IC(2) .EQ. 0) GOTO 50
      XMAXP = CV(2)
      XMINP = XMAXP
   50 POWMAX = HALF * EXPMAX / AMAX1(XMAXP - XMINO, XMAXO, XMINP, XMAXP,
     *  -XMINP)
      IFAULT = 3
      POWNEW = ZERO
      IF (IC(3) .EQ. 0) GOTO 60
      POWNEW = CV(4)
      IF (ABS(POWNEW) .GT. POWMAX) RETURN
   60 YLOC = ZERO
      IF (IC(2) .NE. 0) YLOC = CV(3)
      IF (IC(1) .NE. 0) YLOC = CV(1)
      SYY = ZERO
      IFAULT = 0
C
C        MAIN LOOP OF ALGORITHM
C
      DO 240 ITER = 1, MAXIT
C
C        FIND LSE OF LINEAR PARAMS FOR FIXED POWER P BY ....
C
   70 ZBAR = ZERO
      YBAR = ZERO
      SZZ = ZERO
      SZY = ZERO
      SW = ZERO
      XLOC = XMINP
      IF (POWNEW .GT. ZERO) XLOC = XMAXP
C
C        ... FINDING TRANSFORMED Z VARIABLES AND ACCUMULATING SSQS ...
C
      DO 110 I = 1, N
      IF (IC(1) .EQ. 0) GOTO 80
      Z(I) = EXP((X(I) - XLOC) * POWNEW)
      GOTO 90
   80 Z(I) = BXCX0((X(I) - XLOC), POWNEW)
C
   90 D = W(I)
      IF (D .LE. ZERO) GOTO 110
      ZDIF = Z(I)
      YDIF = Y(I) - YLOC
      IF (IC(1) .NE. 0 .OR. IC(2) .NE. 0) GOTO 100
      SW = SW + D
      C = D / SW
      D = D * (ONE - C)
      ZDIF = ZDIF - ZBAR
      YDIF = YDIF - YBAR
      ZBAR = ZBAR + ZDIF * C
      YBAR = YBAR + YDIF * C
  100 SZZ = SZZ + ZDIF * ZDIF * D
      SZY = SZY + ZDIF * YDIF * D
      IF (ITER .EQ. 1) SYY = SYY + YDIF * YDIF * D
  110 CONTINUE
C
C        ... AND FROM THESE FINDING ESTIMATES, FITTED VALUES AND RSS(P)
C
      B1 = SZY / SZZ
      IF (IC(1) * IC(2) .NE. 0) B1 = CV(3) - CV(1)
      B0 = YBAR - B1 * ZBAR + YLOC
      IF (IC(1) * IC(2) .NE. 0) GOTO 120
      RSSNEW = SYY - B1 * SZY
      GOTO 130
  120 RSSNEW = SYY + B1 * B1 * SZZ - TWO * B1 * SZY
  130 DO 140 I = 1, N
  140 Z(I) = B0 + B1 * Z(I)
      IF (IC(3) .GT. 0 .OR. RSSNEW .LE. ZERO) GOTO 1000
      IF (ITER .NE. 1) GOTO 150
      RSSMAX = RSSNEW
      GOTO 170
C
C        TEST FOR CONVERGENCE, TOO MANY ITERATIONS OR WHETHER RSS(P)
C        HAS INCREASED
C
  150 IF (ABS(RSSNEW - RSSMIN) .LE. EPS1 * RSSMAX .AND. ABS(POWMIN -
     *  POWNEW) .LE. EPS2 * ABS(POWMIN) .AND. DPDP .GE. ZERO) GOTO 1000
      IF (RSSNEW .LE. RSSMIN) GOTO 160
      POWNEW = (POWNEW + POWMIN) * HALF
      GOTO 70
  160 IF (ITER .LT. MAXIT) GOTO 170
      IFAULT = 1
      GOTO 1000
  170 RSSMIN = RSSNEW
      POWMIN = POWNEW
C
C        FIND DERIVATIVES OF RSS(P) W.R.T. POWER P BY ....
C
      DP = ZERO
      DPDP = ZERO
      DPDB0 = ZERO
      DPDB1 = ZERO
      DO 200 I = 1, N
C
C        ... FINDING DERIVATIVES OF EACH TRANSFORMED Z ...
C
      WT = W(I)
      IF (WT .LE. ZERO) GOTO 200
      XSC = X(I) - XLOC
      IF (IC(1) .EQ. 0) GOTO 180
      DZDP = XSC * EXP(XSC * POWMIN)
      D2ZDP2 = DZDP * XSC
      GOTO 190
  180 DZDP = BXCX1(XSC, POWMIN)
      D2ZDP2 = BXCX2(XSC, POWMIN)
C
C        ... ACCUMULATING PARTIAL DERIVATIVES OF RSS  W.R.T. ALL
C        PARAMETERS ...
C
  190 ERR = Y(I) - Z(I)
      DP = DP + ERR * DZDP * WT
      DPDP = DPDP + (B1 * DZDP * DZDP - ERR * D2ZDP2) * WT
      DPDB1 = DPDB1 + (Y(I) - B0 - TWO * ERR) * DZDP * WT
      DPDB0 = DPDB0 + DZDP * WT
  200 CONTINUE
      DP = -TWO * B1 * DP
      DPDP = TWO * B1 * DPDP
      DPDB1 = TWO * DPDB1
      DPDB0 = TWO * B1 * DPDB0
C
C        ... AND FROM THESE OBTAINING THE FULL DERIVATIVES W.R.T. P
C
      IF (IC(1) * IC(2) .NE. 0) GOTO 210
      T = DPDB1 - ZBAR * DPDB0
      DPDP = DPDP - HALF * T * T / SZZ
      IF (IC(1) .EQ. 0 .AND. IC(2) .EQ. 0) DPDP = DPDP - HALF * DPDB0 *
     *  DPDB0 / SW
C
C        FIND MODIFIED NEWTON STEP FOR P, ENSURING THAT NEITHER THE
C        STEP NOR RESULTING POWER IS TOO LARGE
C
  210 PLIM = STEPMX * FLOAT(ITER)
      IF (DPDP .NE. ZERO) GOTO 220
      PSTEP = SIGN(PLIM, DP)
      GOTO 230
  220 PSTEP = DP / ABS(DPDP)
      IF (PSTEP .LT. -PLIM) PSTEP = -PLIM
      IF (PSTEP .GT. PLIM) PSTEP = PLIM
  230 POWNEW = POWMIN - PSTEP
      IF (ITER .EQ. MAXIT - 1 .AND. ABS(PSTEP) * FLOAT(ITER) .GT. HALF *
     *  ABS(POWNEW) .OR. ABS(POWNEW) .GT. POWMAX) POWNEW = SIGN(POWMAX,
     *  -PSTEP)
      IF (POWMIN * POWNEW .GE. POWMAX * POWMAX) GOTO 1000
  240 CONTINUE
C
C        FINALLY RETURN PARAMETER ESTIMATES
C
 1000 RSS = AMAX1(RSSNEW, ZERO)
      IF (ABS(POWNEW) .GE. POWMAX) IFAULT = 2
      P(3) = POWNEW
      IF (IC(1) .EQ. 0) GOTO 1010
      T = B1 * EXP( - POWNEW * XLOC)
      P(1) = B0 + T
      P(2) = T * POWNEW
      RETURN
 1010 P(2) = B1 * EXP( - XLOC * POWNEW)
      P(1) = B0 + B1 * BXCX0( - XLOC, POWNEW)
      RETURN
      END
C
C
C
C
      REAL FUNCTION BXCX0(X, P)
C
C        ALGORITHM AS 212.1 APPL.STATIST. (1985) VOL.34, NO.2
C
C        EVALUATES  (EXP(X*P) - 1)/P
C
      REAL X, P
      REAL EPS, ONE, XP, TERM, SERIES, AI
C
C        CONSTANTS  -  EPS IS MACHINE DEPENDENT
C
      DATA EPS /1.0E-10/
      DATA ONE /1.0/
C
      XP = X * P
      IF (ABS(XP) .LT. ONE) GOTO 10
      BXCX0 = (EXP(XP) - ONE) / P
      RETURN
   10 TERM = ONE
      SERIES = ONE
      AI = ONE
   20 AI = AI + ONE
      TERM = TERM * XP / AI
      SERIES = SERIES + TERM
      IF (ABS(TERM) .GT. EPS) GOTO 20
      BXCX0 = SERIES * X
      RETURN
      END
C
      REAL FUNCTION BXCX1(X, P)
C
C        ALGORITHM AS 212.2 APPL. STATIST. (1985) VOL.34, NO.2
C
C        EVALUATES  DERIVATIVE OF (EXP(X*P) - 1)/P
C        WITH RESPECT TO P
C
      REAL X, P
      REAL EPS, HALF, ONE, TWO, XP, TERM, SERIES, AI
C
C        CONSTANTS  -  EPS IS MACHINE DEPENDENT
C
      DATA EPS /1.0E-10/
      DATA HALF /0.5/, ONE /1.0/, TWO /2.0/
C
      XP = X * P
      IF (ABS(XP) .LT. ONE) GOTO 10
      BXCX1 = ((XP - ONE) * EXP(XP) + ONE) / (P * P)
      RETURN
   10 TERM = HALF
      SERIES = HALF
      AI = ONE
   20 TERM = TERM * (AI + ONE) / AI / (AI + TWO) * XP
      SERIES = SERIES + TERM
      AI = AI + ONE
      IF (ABS(TERM) .GT. EPS) GOTO 20
      BXCX1 = SERIES * (X * X)
      RETURN
      END
C
      REAL FUNCTION BXCX2(X, P)
C
C        ALGORITHM AS 212.3  APPL. STATIST. (1985) VOL.34, NO.2
C
C        EVALUATES  SECOND DERIVATIVE OF (EXP(X*P) - 1)/P
C        WITH RESPECT TO P
C
      REAL X, P
      REAL EPS, ONE, TWO, THREE, XP, TERM, SERIES, AI
C
C        CONSTANTS  -  EPS IS MACHINE DEPENDENT
C
      DATA EPS /1.0E-10/
      DATA ONE /1.0/, TWO /2.0/, THREE /3.0/
C
      XP = X * P
      IF (ABS(XP) .LT. ONE) GOTO 10
      BXCX2 = (((XP - TWO) * XP + TWO) * EXP(XP) - TWO) / (P * P * P)
      RETURN
   10 TERM = ONE / THREE
      SERIES = TERM
      AI = ONE
   20 TERM = TERM * (AI + TWO) / AI / (AI + THREE) * XP
      SERIES = SERIES + TERM
      AI = AI + ONE
      IF (ABS(TERM) .GT. EPS) GOTO 20
      BXCX2 = SERIES * (X * X * X)
      RETURN
      END


