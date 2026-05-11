-- ═══════════════════════════════════════════════════════════════
--  Angoram Secondary School — Student Registration System
--  Full Schema | Grades 9-12 | PNG Secondary School
-- ═══════════════════════════════════════════════════════════════
CREATE DATABASE IF NOT EXISTS angoram_school;
USE angoram_school;

-- ── USERS ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS app_user (
    id         BIGINT       NOT NULL AUTO_INCREMENT,
    username   VARCHAR(80)  NOT NULL UNIQUE,
    password   VARCHAR(255) NOT NULL,
    role       ENUM('ADMIN','TEACHER','PRINCIPAL') NOT NULL DEFAULT 'TEACHER',
    full_name  VARCHAR(160),
    email      VARCHAR(150),
    enabled    BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);

-- ── ACADEMIC YEAR ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS academic_year (
    id          INT     NOT NULL AUTO_INCREMENT,
    year_label  INT     NOT NULL UNIQUE,
    is_current  BOOLEAN NOT NULL DEFAULT FALSE,
    start_date  DATE,
    end_date    DATE,
    created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);

-- ── TERM ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS term (
    id               INT NOT NULL AUTO_INCREMENT,
    academic_year_id INT NOT NULL,
    term_number      INT NOT NULL,
    start_date       DATE,
    end_date         DATE,
    PRIMARY KEY (id),
    UNIQUE KEY uq_term (academic_year_id, term_number),
    CONSTRAINT fk_term_year FOREIGN KEY (academic_year_id) REFERENCES academic_year(id)
);

-- ── CLASS ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS school_class (
    id               BIGINT       NOT NULL AUTO_INCREMENT,
    class_code       VARCHAR(20)  NOT NULL,
    grade_level      INT          NOT NULL,
    academic_year_id INT          NOT NULL,
    class_teacher_id BIGINT,
    max_capacity     INT          NOT NULL DEFAULT 40,
    stream           VARCHAR(80),
    notes            VARCHAR(255),
    created_at       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_class (class_code, academic_year_id),
    CONSTRAINT fk_class_year    FOREIGN KEY (academic_year_id) REFERENCES academic_year(id),
    CONSTRAINT fk_class_teacher FOREIGN KEY (class_teacher_id) REFERENCES app_user(id) ON DELETE SET NULL
);

-- ── SUBJECT ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS subject (
    id            BIGINT       NOT NULL AUTO_INCREMENT,
    subject_code  VARCHAR(20)  NOT NULL UNIQUE,
    subject_name  VARCHAR(120) NOT NULL,
    is_compulsory BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);

-- ── STUDENT ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS student (
    id                    BIGINT       NOT NULL AUTO_INCREMENT,
    student_number        VARCHAR(20)  NOT NULL UNIQUE,
    firstname             VARCHAR(80)  NOT NULL,
    lastname              VARCHAR(80)  NOT NULL,
    date_of_birth         DATE,
    gender                ENUM('MALE','FEMALE','OTHER'),
    contact_phone         VARCHAR(20),
    province              VARCHAR(100),
    district              VARCHAR(100),
    village               VARCHAR(100),
    guardian_name         VARCHAR(160),
    guardian_contact      VARCHAR(20),
    guardian_relationship VARCHAR(80),
    -- Enrolment
    enrolment_type        ENUM('NEW_INTAKE','TRANSFER','CONTINUING') NOT NULL DEFAULT 'NEW_INTAKE',
    grade8_score          DECIMAL(6,2),
    previous_school       VARCHAR(160),
    transfer_clearance    BOOLEAN DEFAULT FALSE,
    -- Current state
    status                ENUM('ACTIVE','SUSPENDED','WITHDRAWN','EXPELLED','GRADUATED') NOT NULL DEFAULT 'ACTIVE',
    current_grade_level   INT,
    current_class_id      BIGINT,
    -- Fees/boarding
    is_boarding           BOOLEAN NOT NULL DEFAULT FALSE,
    tff_registered        BOOLEAN NOT NULL DEFAULT TRUE,
    -- Academic
    times_repeated        INT     NOT NULL DEFAULT 0,
    created_at            DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at            DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_student_class FOREIGN KEY (current_class_id) REFERENCES school_class(id) ON DELETE SET NULL
);

-- ── STUDENT STATUS LOG ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS student_status_log (
    id             BIGINT   NOT NULL AUTO_INCREMENT,
    student_id     BIGINT   NOT NULL,
    old_status     VARCHAR(30),
    new_status     VARCHAR(30) NOT NULL,
    reason         TEXT,
    effective_date DATE     NOT NULL,
    recorded_by    BIGINT,
    created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_log_student  FOREIGN KEY (student_id)  REFERENCES student(id)   ON DELETE CASCADE,
    CONSTRAINT fk_log_recorder FOREIGN KEY (recorded_by) REFERENCES app_user(id)  ON DELETE SET NULL
);

-- ── ANNUAL REGISTRATION ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS annual_registration (
    id               BIGINT   NOT NULL AUTO_INCREMENT,
    student_id       BIGINT   NOT NULL,
    academic_year_id INT      NOT NULL,
    class_id         BIGINT,
    grade_level      INT      NOT NULL,
    reg_status       ENUM('PENDING','CONFIRMED','WITHDRAWN') NOT NULL DEFAULT 'PENDING',
    reg_date         DATE,
    notes            VARCHAR(255),
    registered_by    BIGINT,
    created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_reg (student_id, academic_year_id),
    CONSTRAINT fk_reg_student FOREIGN KEY (student_id)       REFERENCES student(id)       ON DELETE CASCADE,
    CONSTRAINT fk_reg_year    FOREIGN KEY (academic_year_id) REFERENCES academic_year(id),
    CONSTRAINT fk_reg_class   FOREIGN KEY (class_id)         REFERENCES school_class(id)         ON DELETE SET NULL,
    CONSTRAINT fk_reg_by      FOREIGN KEY (registered_by)    REFERENCES app_user(id)      ON DELETE SET NULL
);

-- ── FEE LEVY TYPE ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS fee_levy_type (
    id               INT          NOT NULL AUTO_INCREMENT,
    levy_name        VARCHAR(120) NOT NULL,
    amount           DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    academic_year_id INT          NOT NULL,
    applies_to       ENUM('ALL','BOARDING','NON_BOARDING') NOT NULL DEFAULT 'ALL',
    description      VARCHAR(255),
    created_at       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_levy_year FOREIGN KEY (academic_year_id) REFERENCES academic_year(id)
);

-- ── FEE PAYMENT ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS fee_payment (
    id                BIGINT        NOT NULL AUTO_INCREMENT,
    student_id        BIGINT        NOT NULL,
    academic_year_id  INT           NOT NULL,
    levy_type_id      INT,
    amount_paid       DECIMAL(10,2) NOT NULL,
    payment_date      DATE          NOT NULL DEFAULT (CURRENT_DATE),
    payment_method    ENUM('CASH','BANK_TRANSFER','ONLINE') NOT NULL DEFAULT 'CASH',
    reference_number  VARCHAR(100),
    receipt_number    VARCHAR(100),
    notes             VARCHAR(255),
    receipt_file_name VARCHAR(255),
    receipt_file_path VARCHAR(500),
    receipt_file_type VARCHAR(100),
    receipt_file_size BIGINT,
    recorded_by       BIGINT,
    created_at        DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_pay_student FOREIGN KEY (student_id)       REFERENCES student(id)       ON DELETE CASCADE,
    CONSTRAINT fk_pay_year    FOREIGN KEY (academic_year_id) REFERENCES academic_year(id),
    CONSTRAINT fk_pay_levy    FOREIGN KEY (levy_type_id)     REFERENCES fee_levy_type(id) ON DELETE SET NULL,
    CONSTRAINT fk_pay_by      FOREIGN KEY (recorded_by)      REFERENCES app_user(id)      ON DELETE SET NULL
);

-- ── ATTENDANCE ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS attendance (
    id              BIGINT   NOT NULL AUTO_INCREMENT,
    student_id      BIGINT   NOT NULL,
    class_id        BIGINT   NOT NULL,
    academic_year_id INT     NOT NULL,
    attendance_date DATE     NOT NULL,
    status          ENUM('PRESENT','ABSENT','LATE','EXCUSED') NOT NULL DEFAULT 'PRESENT',
    notes           VARCHAR(255),
    recorded_by     BIGINT,
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_attendance (student_id, attendance_date),
    CONSTRAINT fk_att_student FOREIGN KEY (student_id)       REFERENCES student(id)   ON DELETE CASCADE,
    CONSTRAINT fk_att_class   FOREIGN KEY (class_id)         REFERENCES school_class(id)     ON DELETE CASCADE,
    CONSTRAINT fk_att_year    FOREIGN KEY (academic_year_id) REFERENCES academic_year(id),
    CONSTRAINT fk_att_by      FOREIGN KEY (recorded_by)      REFERENCES app_user(id)  ON DELETE SET NULL
);

-- ── ASSESSMENT ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS assessment (
    id               BIGINT        NOT NULL AUTO_INCREMENT,
    student_id       BIGINT        NOT NULL,
    subject_id       BIGINT        NOT NULL,
    term_id          INT           NOT NULL,
    academic_year_id INT           NOT NULL,
    class_id         BIGINT,
    assessment_type  ENUM('CONTINUOUS','FINAL_EXAM','COMBINED') NOT NULL DEFAULT 'CONTINUOUS',
    score            DECIMAL(6,2),
    max_score        DECIMAL(6,2)  NOT NULL DEFAULT 100.00,
    grade_letter     VARCHAR(4),
    recorded_by      BIGINT,
    notes            VARCHAR(255),
    created_at       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_assessment (student_id, subject_id, term_id, assessment_type),
    CONSTRAINT fk_ass_student FOREIGN KEY (student_id)       REFERENCES student(id)       ON DELETE CASCADE,
    CONSTRAINT fk_ass_subject FOREIGN KEY (subject_id)       REFERENCES subject(id),
    CONSTRAINT fk_ass_term    FOREIGN KEY (term_id)          REFERENCES term(id),
    CONSTRAINT fk_ass_year    FOREIGN KEY (academic_year_id) REFERENCES academic_year(id),
    CONSTRAINT fk_ass_class   FOREIGN KEY (class_id)         REFERENCES school_class(id)         ON DELETE SET NULL,
    CONSTRAINT fk_ass_by      FOREIGN KEY (recorded_by)      REFERENCES app_user(id)      ON DELETE SET NULL
);

-- ── YEAR END RESULT ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS year_end_result (
    id               BIGINT       NOT NULL AUTO_INCREMENT,
    student_id       BIGINT       NOT NULL,
    academic_year_id INT          NOT NULL,
    grade_level      INT          NOT NULL,
    class_id         BIGINT,
    final_average    DECIMAL(5,2),
    class_rank       INT,
    outcome          ENUM('PROMOTED','REPEAT','GRADUATED','WITHDRAWN','EXPELLED','SELECTED_GRADE11') NOT NULL,
    next_grade_level INT,
    is_exam_eligible BOOLEAN      NOT NULL DEFAULT TRUE,
    attendance_pct   DECIMAL(5,2),
    notes            TEXT,
    processed_by     BIGINT,
    processed_at     DATETIME,
    created_at       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_year_result (student_id, academic_year_id),
    CONSTRAINT fk_yr_student FOREIGN KEY (student_id)       REFERENCES student(id)       ON DELETE CASCADE,
    CONSTRAINT fk_yr_year    FOREIGN KEY (academic_year_id) REFERENCES academic_year(id),
    CONSTRAINT fk_yr_class   FOREIGN KEY (class_id)         REFERENCES school_class(id)         ON DELETE SET NULL,
    CONSTRAINT fk_yr_by      FOREIGN KEY (processed_by)     REFERENCES app_user(id)      ON DELETE SET NULL
);

-- ── TRIGGERS ─────────────────────────────────────────────────
DELIMITER $$
DROP TRIGGER IF EXISTS trg_log_status$$
CREATE TRIGGER trg_log_status
AFTER UPDATE ON student FOR EACH ROW
BEGIN
    IF OLD.status != NEW.status THEN
        INSERT INTO student_status_log(student_id,old_status,new_status,effective_date)
        VALUES(NEW.id, OLD.status, NEW.status, CURRENT_DATE);
    END IF;
END$$

DROP TRIGGER IF EXISTS trg_class_capacity$$
CREATE TRIGGER trg_class_capacity
BEFORE UPDATE ON student FOR EACH ROW
BEGIN
    DECLARE cnt INT; DECLARE cap INT;
    IF NEW.current_class_id IS NOT NULL
       AND NEW.current_class_id != IFNULL(OLD.current_class_id,0) THEN
        SELECT COUNT(*) INTO cnt FROM student
        WHERE current_class_id=NEW.current_class_id AND id!=NEW.id AND status='ACTIVE';
        SELECT max_capacity INTO cap FROM school_class WHERE id=NEW.current_class_id;
        IF cnt >= cap THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT='Class is at full capacity.';
        END IF;
    END IF;
END$$
DELIMITER ;

-- ── SEED DATA ─────────────────────────────────────────────────
-- Passwords: admin123 (BCrypt)
INSERT IGNORE INTO app_user(username,password,role,full_name) VALUES
('admin',     '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh8y','ADMIN',    'System Administrator'),
('principal', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh8y','PRINCIPAL','School Principal');

INSERT IGNORE INTO academic_year(year_label,is_current,start_date,end_date) VALUES
(2025,FALSE,'2025-01-13','2025-11-28'),
(2026,TRUE, '2026-01-12','2026-11-27');

INSERT IGNORE INTO term(academic_year_id,term_number,start_date,end_date) VALUES
(2,1,'2026-01-12','2026-03-27'),(2,2,'2026-04-13','2026-06-26'),
(2,3,'2026-07-13','2026-09-25'),(2,4,'2026-10-12','2026-11-27');

INSERT IGNORE INTO school_class(class_code,grade_level,academic_year_id,max_capacity) VALUES
('9A',9,2,40),('9B',9,2,40),('10A',10,2,38),('10B',10,2,38),('11',11,2,35),('12',12,2,30);

INSERT IGNORE INTO subject(subject_code,subject_name,is_compulsory) VALUES
('ENG','English',TRUE),('MATH','Mathematics',TRUE),('SCI','General Science',TRUE),
('SOC','Social Science',TRUE),('BIZ','Business Studies',FALSE),
('AGR','Agriculture',FALSE),('ICT','Information Technology',FALSE),
('HE','Health Education',TRUE),('PE','Physical Education',TRUE);

INSERT IGNORE INTO fee_levy_type(levy_name,amount,academic_year_id,applies_to,description) VALUES
('Boarding Fee',1200.00,2,'BOARDING','Annual boarding and accommodation fee'),
('Examination Fee',150.00,2,'ALL','National examination entry fee'),
('Resource Fee',80.00,2,'ALL','Textbooks, lab materials, sports equipment');

-- ════════════════════════════════════════════════════════════════
-- STORED PROCEDURES & FUNCTIONS (CP1 - Modular SQL Logic)
-- ════════════════════════════════════════════════════════════════
DELIMITER $$

-- Procedure: Get full enrolment summary for a class
DROP PROCEDURE IF EXISTS sp_class_summary$$
CREATE PROCEDURE sp_class_summary(IN p_class_id BIGINT)
BEGIN
    SELECT
        c.class_code,
        c.grade_level,
        COUNT(s.id)                                          AS total_students,
        SUM(s.status = 'ACTIVE')                            AS active_count,
        SUM(s.status = 'SUSPENDED')                         AS suspended_count,
        SUM(s.is_boarding)                                  AS boarding_count,
        SUM(s.tff_registered)                               AS tff_count,
        ROUND(SUM(s.status='ACTIVE') / c.max_capacity*100,1) AS capacity_pct
    FROM school_class c
    LEFT JOIN student s ON s.current_class_id = c.id
    WHERE c.id = p_class_id
    GROUP BY c.id, c.class_code, c.grade_level, c.max_capacity;
END$$

-- Procedure: Get fee collection summary for an academic year
DROP PROCEDURE IF EXISTS sp_fee_year_summary$$
CREATE PROCEDURE sp_fee_year_summary(IN p_year_id INT)
BEGIN
    SELECT
        s.id            AS student_id,
        s.student_number,
        CONCAT(s.firstname,' ',s.lastname)      AS student_name,
        s.current_grade_level                   AS grade,
        COUNT(fp.id)                            AS payment_count,
        COALESCE(SUM(fp.amount_paid),0)         AS total_paid,
        MAX(fp.payment_date)                    AS last_payment_date,
        fp.payment_method                       AS last_method
    FROM student s
    LEFT JOIN fee_payment fp
           ON fp.student_id = s.id AND fp.academic_year_id = p_year_id
    WHERE s.status = 'ACTIVE'
    GROUP BY s.id, s.student_number, student_name, s.current_grade_level, fp.payment_method
    ORDER BY total_paid DESC;
END$$

-- Function: Calculate a student's attendance percentage
DROP FUNCTION IF EXISTS fn_attendance_pct$$
CREATE FUNCTION fn_attendance_pct(p_student_id BIGINT, p_year_id INT)
RETURNS DECIMAL(5,2)
DETERMINISTIC
BEGIN
    DECLARE v_total  INT DEFAULT 0;
    DECLARE v_present INT DEFAULT 0;
    SELECT COUNT(*) INTO v_total
    FROM attendance
    WHERE student_id = p_student_id AND academic_year_id = p_year_id;
    IF v_total = 0 THEN RETURN 0; END IF;
    SELECT COUNT(*) INTO v_present
    FROM attendance
    WHERE student_id = p_student_id AND academic_year_id = p_year_id AND status = 'PRESENT';
    RETURN ROUND(v_present / v_total * 100, 2);
END$$

-- Function: Get letter grade from a numeric score
DROP FUNCTION IF EXISTS fn_grade_letter$$
CREATE FUNCTION fn_grade_letter(p_score DECIMAL(6,2))
RETURNS VARCHAR(4)
DETERMINISTIC
BEGIN
    IF p_score >= 90 THEN RETURN 'A+';
    ELSEIF p_score >= 80 THEN RETURN 'A';
    ELSEIF p_score >= 70 THEN RETURN 'B';
    ELSEIF p_score >= 60 THEN RETURN 'C';
    ELSEIF p_score >= 50 THEN RETURN 'D';
    ELSE RETURN 'F';
    END IF;
END$$

DELIMITER ;

-- ════════════════════════════════════════════════════════════════
-- AGGREGATE REPORT VIEWS (CP2 - Report Generation with GROUP BY)
-- ════════════════════════════════════════════════════════════════

-- View: Enrolment by grade level (SELECT + GROUP BY)
CREATE OR REPLACE VIEW vw_enrolment_by_grade AS
SELECT
    s.current_grade_level       AS grade_level,
    COUNT(*)                    AS total_students,
    SUM(s.status = 'ACTIVE')    AS active,
    SUM(s.status = 'SUSPENDED') AS suspended,
    SUM(s.status = 'GRADUATED') AS graduated,
    SUM(s.is_boarding)          AS boarding,
    SUM(s.enrolment_type = 'NEW_INTAKE') AS new_intake,
    SUM(s.enrolment_type = 'TRANSFER')   AS transfers
FROM student s
WHERE s.current_grade_level IS NOT NULL
GROUP BY s.current_grade_level
ORDER BY s.current_grade_level;

-- View: Fee collection by payment method (JOIN + GROUP BY)
CREATE OR REPLACE VIEW vw_fee_by_method AS
SELECT
    ay.year_label,
    fp.payment_method,
    COUNT(fp.id)         AS payment_count,
    SUM(fp.amount_paid)  AS total_collected
FROM fee_payment fp
JOIN academic_year ay ON ay.id = fp.academic_year_id
GROUP BY ay.year_label, fp.payment_method
ORDER BY ay.year_label DESC, total_collected DESC;

-- View: Province distribution of students
CREATE OR REPLACE VIEW vw_students_by_province AS
SELECT
    COALESCE(s.province,'Unknown') AS province,
    COUNT(*)                        AS student_count,
    SUM(s.status = 'ACTIVE')        AS active_count
FROM student s
GROUP BY s.province
ORDER BY student_count DESC;

-- View: Class rankings (JOIN + GROUP BY + aggregate)
CREATE OR REPLACE VIEW vw_class_avg_scores AS
SELECT
    c.class_code,
    c.grade_level,
    sub.subject_name,
    t.term_number,
    COUNT(a.id)              AS students_assessed,
    ROUND(AVG(a.score), 2)   AS avg_score,
    MAX(a.score)             AS highest_score,
    MIN(a.score)             AS lowest_score
FROM assessment a
JOIN school_class   c   ON c.id   = a.class_id
JOIN subject sub ON sub.id = a.subject_id
JOIN term    t   ON t.id   = a.term_id
WHERE a.score IS NOT NULL
GROUP BY c.class_code, c.grade_level, sub.subject_name, t.term_number
ORDER BY c.grade_level, t.term_number, avg_score DESC;
