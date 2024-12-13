CSTART OF AS 64/109
      REAL FUNCTION XINBTA(P, Q, BETA, ALPHA, IFAULT)
C
C        ALGORITHM AS 109  APPL. STATIST. (1977) VOL.26, P.111
C        (REPLACING ALGORITHM AS 64  APPL. STATIST. (1973),
C        VOL.22, P.411)
C
C        COMPUTES INVERSE OF INCOMPLETE BETA FUNCTION
C        RATIO FOR GIVEN POSITIVE VALUES OF THE ARGUMENTS
C        P AND Q, ALPHA BETWEEN ZERO AND ONE.
C        LOG OF COMPLETE BETA FUNCTION, BETA, IS ASSUMED TO BE
C        KNOWN.
C
      LOGICAL INDEX
      REAL A, ALPHA, ADJ, BETA, G, H, P, PP, PREV, Q, QQ, R, S,
     $  SQ, T, TX, W, Y, YPREV, ZERO, HALF, ONE, TWO, THREE,
     $  FOUR, FIVE, SIX, NINE, ACU, LOWER, UPPER, CONST1,
     $  CONST2, CONST3, CONST4, BETAIN, ZEXP, ZLOG, ZSQRT
C
C        DEFINE ACCURACY AND INITIALIZE
C
      DATA ZERO, HALF, ONE, TWO, THREE, FOUR, FIVE, SIX, NINE
     $     /0.0,  0.5, 1.0, 2.0,   3.0,  4.0,  5.0, 6.0,  9.0/
      DATA   ACU,  LOWER,  UPPER,  CONST1,  CONST2,  CONST3,  CONST4
     $  /1.0E-14, 0.0001, 0.9999, 2.30753, 0.27061, 0.99229, 0.04481/
C
      ZEXP(A) = EXP(A)
      ZLOG(A) = ALOG(A)
      ZSQRT(A) = SQRT(A)
C
      XINBTA = ALPHA
C
C        TEST FOR ADMISSIBILITY OF PARAMETERS
C
      IFAULT = 1
      IF (P .LE. ZERO .OR. Q .LE. ZERO) RETURN
      IFAULT = 2
      IF (ALPHA .LT. ZERO .OR. ALPHA .GT. ONE) RETURN
      IFAULT = 0
      IF (ALPHA .EQ. ZERO .OR. ALPHA .EQ. ONE) RETURN
C
C        CHANGE TAIL IF NECESSARY
C
      IF (ALPHA .LE. HALF) GOTO 1
      A = ONE - ALPHA
      PP = Q
      QQ = P
      INDEX = .TRUE.
      GOTO 2
    1 A = ALPHA
      PP = P
      QQ = Q
      INDEX = .FALSE.
C
C        CALCULATE THE INITIAL APPROXIMATION
C
    2 R = ZSQRT(-ZLOG(A * A))
      Y = R - (CONST1 + CONST2 * R) / (ONE + (CONST3 + CONST4 *
     $  R) * R)
      IF (PP .GT. ONE .AND. QQ .GT. ONE) GOTO 5
      R = QQ + QQ
      T = ONE / (NINE * QQ)
      T = R * (ONE - T + Y * ZSQRT(T)) ** 3
      IF (T .LE. ZERO) GOTO 3
      T = (FOUR * PP + R - TWO) / T
      IF (T .LE. ONE) GOTO 4
      XINBTA = ONE - TWO / (T + ONE)
      GOTO 6
    3 XINBTA = ONE - ZEXP((ZLOG((ONE - A) * QQ) + BETA) / QQ)
      GOTO 6
    4 XINBTA = ZEXP((ZLOG(A * PP) + BETA) / PP)
      GOTO 6
    5 R = (Y * Y - THREE) / SIX
      S = ONE / (PP + PP - ONE)
      T = ONE / (QQ + QQ - ONE)
      H = TWO / (S + T)
      W = Y * ZSQRT(H + R) / H - (T - S) * (R + FIVE / SIX -
     $  TWO / (THREE * H))
      XINBTA = PP / (PP + QQ * ZEXP(W + W))
C
C        SOLVE FOR X BY A MODIFIED NEWTON-RAPHSON METHOD,
C        USING THE FUNCTION BETAIN
C
    6 R = ONE - PP
      T = ONE - QQ
      YPREV = ZERO
      SQ = ONE
      PREV = ONE
      IF (XINBTA .LT. LOWER) XINBTA = LOWER
      IF (XINBTA .GT. UPPER) XINBTA = UPPER
    7 Y = BETAIN(XINBTA, PP, QQ, BETA, IFAULT)
      IF (IFAULT .EQ. 0) GOTO 8
      IFAULT = 3
      RETURN
    8 Y = (Y - A) * ZEXP(BETA + R * ZLOG(XINBTA) + T *
     $  ZLOG(ONE - XINBTA))
      IF (Y * YPREV .LE. ZERO) PREV = SQ
      G = ONE
    9 ADJ = G * Y
      SQ = ADJ * ADJ
      IF (SQ .GE. PREV) GOTO 10
      TX = XINBTA - ADJ
      IF (TX .GE. ZERO .AND. TX .LE. ONE) GOTO 11
   10 G = G / THREE
      GOTO 9
   11 IF (PREV .LE. ACU) GOTO 12
      IF (Y * Y .LE. ACU) GOTO 12
      IF (TX .EQ. ZERO .OR. TX .EQ. ONE) GOTO 10
      IF (TX .EQ. XINBTA) GOTO 12
      XINBTA = TX
      YPREV = Y
      GOTO 7
   12 IF (INDEX) XINBTA = ONE - XINBTA
      RETURN
      END
CEND OF AS 64/109



     double precision function xinbta(p,q,beta,alpha,ifault)
      implicit double precision (a-h,o-z)
c
c     algorithm as 109 appl. statist. (1977), vol.26, no.1
c     (replacing algorithm as 64  appl. statist. (1973),
c     vol.22, no.3)
c
c     Remark AS R83 and the correction in vol40(1) p.236 have been
c     incorporated in this version.
c
c     Computes inverse of the incomplete beta function
c     ratio for given positive values of the arguments
c     p and q, alpha between zero and one.
c     log of complete beta function, beta, is assumed to be known.
c
c     Auxiliary function required: BETAIN = algorithm AS63
c
      logical indx
c
c     Define accuracy and initialise.
c     SAE below is the most negative decimal exponent which does not
c     cause an underflow; a value of -308 or thereabouts will often be
c     OK in double precision.
c
c     data acu/1.0d-14/
      data SAE/-37.D0/
      data zero/0.0d0/, one/1.0d0/, two/2.0d0/
      data three/3.0d0/, four/4.0d0/, five/5.0d0/, six/6.0d0/
c
      fpu = 10.d0 ** sae
      xinbta = alpha
c
c     test for admissibility of parameters
c
      ifault = 1
      if (p.le.zero .or. q.le.zero) return
      ifault = 2
      if (alpha.lt.zero .or. alpha.gt.one) return
      ifault = 0
      if (alpha.eq.zero .or. alpha.eq.one) return
c
c     change tail if necessary
c
      if (alpha.le.0.5d0) goto 1
      a = one-alpha
      pp = q
      qq = p
      indx = .true.
      goto 2
    1 a = alpha
      pp = p
      qq = q
      indx = .false.
c
c     calculate the initial approximation
c
    2 r = dsqrt(-dlog(a*a))
      y = r-(2.30753d0+0.27061d0*r)/(one+(0.99229d0+0.04481d0*r)*r)
      if(pp.gt.one .and. qq.gt.one) goto 5
      r = qq+qq
      t = one/(9.0d0*qq)
      t = r*(one-t+y*dsqrt(t))**3
      if(t.le.zero) goto 3
      t = (four*pp+r-two)/t
      if(t.le.one) goto 4
      xinbta = one-two/(t+one)
      goto 6
    3 xinbta = one-dexp((dlog((one-a)*qq)+beta)/qq)
      goto 6
    4 xinbta = dexp((dlog(a*pp)+beta)/pp)
      goto 6
    5 r = (y*y-three)/six
      s = one/(pp+pp-one)
      t = one/(qq+qq-one)
      h = two/(s+t)
      w = y*dsqrt(h+r)/h-(t-s)*(r+five/six-two/(three*h))
      xinbta = pp/(pp+qq*dexp(w+w))
c
c     solve for x by a modified newton-raphson method,
c     using the function betain
c
    6 r = one-pp
      t = one-qq
      yprev = zero
      sq = one
      prev = one
      if(xinbta.lt.0.0001d0) xinbta = 0.0001d0
      if(xinbta.gt.0.9999d0) xinbta = 0.9999d0
      IEX = MAX(-5.D0/PP**2 - 1.D0/A**.2 - 13.D0, SAE)
      ACU = 10.D0 ** IEX
    7 y = betain(xinbta,pp,qq,beta,ifault)
      if(ifault.eq.0) goto 8
      ifault = 3
      return
    8 continue
      xin = xinbta
      y = (y-a)*exp(beta+r*log(xin)+t*log(one-xin))
      if(y*yprev.le.zero) prev = max(sq, fpu)
      g = one
    9 adj = g*y
      sq = adj*adj
      if(sq.ge.prev) goto 10
      tx = xinbta-adj
      if(tx.ge.zero .and. tx.le.one) goto 11
   10 g = g/three
      goto 9
   11 if(prev.le.acu) goto 12
      if(y*y.le.acu) goto 12
      if(tx.eq.zero .or. tx.eq.one) goto 10
      if(tx.eq.xinbta) goto 12
      xinbta = tx
      yprev = y
      goto 7
   12 if (indx) xinbta = one-xinbta
      return
      end

