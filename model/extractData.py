import pandas as pd
import logging
import sys

class ColorFormatter(logging.Formatter):
    COLORS = {
        logging.DEBUG: "\033[36m",
        logging.INFO: "\033[32m",
        logging.WARNING: "\033[33m",
        logging.ERROR: "\033[31m",
        logging.CRITICAL: "\033[1;31m"
    }

    RESET = "\033[0m"

    def format(self, record):
        color = self.COLORS.get(record.levelno, self.RESET)
        message = super().format(record)
        return f"{color}{message}{self.RESET}"


handler = logging.StreamHandler(sys.stdout)
formatter = ColorFormatter(
    "%(asctime)s | %(levelname)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)
handler.setFormatter(formatter)

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)
logger.addHandler(handler)
logger.propagate = False
# =========================
# LOAD DATA
# =========================
logger.info("Loading GWAS data...")
datafile = pd.read_csv('gwas_file.tsv', sep='\t', low_memory=False)
logger.info(f"Original dataset shape: {datafile.shape}")

try:
    with open('gwas_file.tsv', 'r') as f:
        first_line = f.readline().strip()
        second_line = f.readline().strip()

    if len(second_line.split('\t')) > len(first_line.split('\t')):
        logger.warning("Column shift detected — fixing schema")

        df_fixed = datafile.iloc[:, 1:].copy()
        df_fixed.columns = datafile.columns[:-1]

        logger.info(f"Fixed DataFrame shape: {df_fixed.shape}")

        clean_df = pd.DataFrame()

        clean_df['REGION'] = df_fixed.iloc[:, 8]
        clean_df['CHR_ID'] = pd.to_numeric(df_fixed.iloc[:, 9], errors='coerce')
        clean_df['MAPPED_GENE'] = df_fixed.iloc[:, 11]
        clean_df['STRONGEST_SNP_RISK_ALLELE'] = df_fixed.iloc[:, 17]
        clean_df['SNPS'] = df_fixed.iloc[:, 18]
        clean_df['CONTEXT'] = df_fixed.iloc[:, 21]
        clean_df['INTERGENIC'] = df_fixed.iloc[:, 22]
        clean_df['RISK_ALLELE_FREQUENCY'] = pd.to_numeric(df_fixed.iloc[:, 23], errors='coerce')
        clean_df['P_VALUE'] = pd.to_numeric(df_fixed.iloc[:, 24], errors='coerce')
        clean_df['P_VALUE_MLOG'] = pd.to_numeric(df_fixed.iloc[:, 25], errors='coerce')
        clean_df['CI_95'] = df_fixed.iloc[:, 28]
        clean_df['EFFECT_SIZE_RANGE'] = df_fixed.iloc[:, 29]
        clean_df['DISEASE/TRAIT'] = df_fixed.iloc[:, 5]

        logger.info("All columns extracted successfully")
        logger.info(f"Cleaned data shape: {clean_df.shape}")
        logger.info(f"Extracted columns: {list(clean_df.columns)}")

    else:
        logger.info("No column shift detected — dataset structure is OK")
        clean_df = datafile.copy()

except Exception:
    logger.error("Error during data extraction", exc_info=True)


if 'clean_df' in locals():
    clean_df.to_csv('gwas_clean_data.csv', index=False)
    logger.info("Clean data saved to 'gwas_clean_data.csv'")