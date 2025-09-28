import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font, Svg, Path } from '@react-pdf/renderer';
import { ExistingCompanyResponse, SelectedOrganisme, ServiceResponseData } from '@/types/company-response';
import { CalculatedMetrics } from '@/types/metrics';

// Register fonts for better PDF rendering
Font.register({
  family: 'Helvetica',
  src: 'https://fonts.gstatic.com/s/opensans/v17/mem8YaGs126MiZpBA-UFVZ0e.ttf'
});

// Define styles that match ResponseDetails design
const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 8,
    padding: 12,
    backgroundColor: '#ffffff',
  },
  
  // Yellow Header Section
  header: {
    backgroundColor: '#FDE047',
    borderLeftWidth: 6,
    borderLeftColor: '#28007e',
    borderLeftStyle: 'solid',
    padding: 12,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  headerLeft: {
    flex: 1,
  },
  
  headerTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 3,
  },
  
  headerDate: {
    fontSize: 8,
    color: '#ffffff',
  },
  
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  
  revenueLabel: {
    fontSize: 8,
    color: '#ffffff',
    textAlign: 'center',
  },
  
  revenueAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginVertical: 3,
  },
  
  headerRight: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 10,
  },
  
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  
  detailLabel: {
    fontSize: 7,
    color: '#6B7280',
  },
  
  detailValue: {
    fontSize: 7,
    fontWeight: 'bold',
  },
  
  servicesBadge: {
    backgroundColor: '#16A34A',
    color: '#ffffff',
    padding: 3,
    fontSize: 6,
    textAlign: 'center',
    marginTop: 6,
  },
  
  // Main Content
  mainContent: {
    flexDirection: 'row',
    gap: 12,
  },
  
  leftColumn: {
    flex: 2,
  },
  
  rightColumn: {
    flex: 1,
  },
  
  sectionTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 6,
  },
  
  // Table Styles
  table: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderStyle: 'solid',
    marginBottom: 6,
  },
  
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderBottomWidth: 1,
    borderBottomColor: '#D1D5DB',
    borderBottomStyle: 'solid',
    padding: 4,
  },
  
  tableHeaderCell: {
    flex: 1,
    fontSize: 7,
    fontWeight: 'bold',
    color: '#374151',
  },
  
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    borderBottomStyle: 'solid',
    padding: 3,
  },
  
  tableRowBlue: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    borderBottomStyle: 'solid',
    padding: 3,
    backgroundColor: '#EFF6FF',
  },
  
  tableRowGray: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    borderBottomStyle: 'solid',
    padding: 3,
    backgroundColor: '#F9FAFB',
  },
  
  tableCell: {
    flex: 1,
    fontSize: 7,
  },
  
  tableCellBold: {
    flex: 1,
    fontSize: 7,
    fontWeight: 'bold',
  },
  
  tableCellAmount: {
    flex: 1,
    fontSize: 7,
    textAlign: 'right',
  },
  
  tableCellAmountBold: {
    flex: 1,
    fontSize: 7,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  
  // Right Column Cards
  card: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderStyle: 'solid',
    padding: 8,
    marginBottom: 8,
  },
  
  cardTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 6,
  },
  
  chartContainer: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  
  chartText: {
    color: '#6B7280',
    fontSize: 7,
    textAlign: 'center',
  },
  
  legendContainer: {
    marginTop: 8,
  },
  
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  
  legendColor: {
    width: 8,
    height: 8,
    marginRight: 6,
  },
  
  legendText: {
    fontSize: 6,
    color: '#374151',
    flex: 1,
  },
  
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  
  summaryLabel: {
    color: '#6B7280',
    fontSize: 7,
  },
  
  summaryValue: {
    fontWeight: 'bold',
    fontSize: 7,
  },
  
  // Additional styles for new layout
  tableRowHeaderGray: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    borderBottomStyle: 'solid',
    padding: 3,
    backgroundColor: '#F3F4F6',
  },
  
  summaryTotal: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    borderTopStyle: 'solid',
    paddingTop: 4,
    marginTop: 6,
  },
  
  totalLabel: {
    fontWeight: 'bold',
    fontSize: 7,
  },
  
  totalValue: {
    fontWeight: 'bold',
    color: '#059669',
    fontSize: 7,
  },
  
  orangeAmount: {
    color: '#EA580C',
    fontWeight: 'bold',
    fontSize: 12,
    textAlign: 'center',
  },
  
  footerNotes: {
    backgroundColor: '#F9FAFB',
    padding: 6,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    borderTopStyle: 'solid',
    marginTop: 6,
  },
  
  footerText: {
    fontSize: 6,
    color: '#6B7280',
    marginBottom: 2,
  },
});

interface ResponseDetailsPDFProps {
  response: ExistingCompanyResponse;
  metrics: CalculatedMetrics;
  requestData: { tjm: number; days: number };
}

// Helper function to create pie chart paths
const createPieSlice = (centerX: number, centerY: number, radius: number, startAngle: number, endAngle: number) => {
  const start = polarToCartesian(centerX, centerY, radius, endAngle);
  const end = polarToCartesian(centerX, centerY, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  return [
    "M", centerX, centerY,
    "L", start.x, start.y,
    "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y,
    "Z"
  ].join(" ");
};

const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
  const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
  return {
    x: centerX + (radius * Math.cos(angleInRadians)),
    y: centerY + (radius * Math.sin(angleInRadians))
  };
};

const ResponseDetailsPDF: React.FC<ResponseDetailsPDFProps> = ({ response, metrics, requestData }) => {
  // Helper function to format dates
  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Pie chart data
  const chartData = [
    {
      label: 'Salaire net versé',
      value: metrics.netFinal || 0,
      color: '#F9F6B8', // Lightest yellow - matches your image
      percentage: ((metrics.netFinal || 0) / (metrics.chiffreAffaires || 1) * 100)
    },
    {
      label: 'Frais de gestion',
      value: metrics.fraisGestionAmount || 0,
      color: '#F4D03F', // Medium light yellow - matches your image
      percentage: ((metrics.fraisGestionAmount || 0) / (metrics.chiffreAffaires || 1) * 100)
    },
    {
      label: 'Cotisations patronales',
      value: metrics.chargesPatronales || 0,
      color: '#F1C40F', // Medium yellow - matches your image
      percentage: ((metrics.chargesPatronales || 0) / (metrics.chiffreAffaires || 1) * 100)
    },
    {
      label: 'Cotisations salariales',
      value: metrics.chargesSalariales || 0,
      color: '#D4AC0D', // Darker yellow - matches your image
      percentage: ((metrics.chargesSalariales || 0) / (metrics.chiffreAffaires || 1) * 100)
    }
  ];
  
  // Calculate angles for pie slices
  let currentAngle = 0;
  const pieSlices = chartData.map(item => {
    const sliceAngle = (item.percentage / 100) * 360;
    const slice = {
      ...item,
      startAngle: currentAngle,
      endAngle: currentAngle + sliceAngle,
      path: createPieSlice(50, 50, 40, currentAngle, currentAngle + sliceAngle)
    };
    currentAngle += sliceAngle;
    return slice;
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Yellow Header Section */}
        <View style={styles.header}>
          {/* Left: Company Title */}
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>SIMULATION DE PORTAGE SALARIAL</Text>
            <Text style={styles.headerDate}>DATE : {formatDate(new Date())}</Text>
          </View>
          
          {/* Center: Revenue Info */}
          <View style={styles.headerCenter}>
            <Text style={styles.revenueLabel}>Chiffre d'affaires</Text>
            <Text style={styles.revenueLabel}>(HT mensuel)</Text>
            <Text style={styles.revenueAmount}>{(metrics.chiffreAffaires || 0).toFixed(0)} €</Text>
          </View>
          
          {/* Right: Contract Details */}
          <View style={styles.headerRight}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>TJM</Text>
              <Text style={styles.detailValue}>{requestData.tjm}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Nombre de jours travaillés</Text>
              <Text style={styles.detailValue}>{requestData.days} J/MOIS</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Net à payer avant impôt</Text>
              <Text style={styles.detailValue}>{(metrics.netBeforeServices || 0).toFixed(0)} €/MOIS</Text>
            </View>
            {response.response_data?.frais_de_gestion && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Frais de gestion</Text>
                <Text style={styles.detailValue}>{response.response_data.frais_de_gestion.value}%</Text>
              </View>
            )}
            {response.response_data?.services && response.response_data.services.some((s: ServiceResponseData) => s.is_available) && (
              <Text style={styles.servicesBadge}>
                {response.response_data.services.filter((s: ServiceResponseData) => s.is_available).length} service(s) inclus
              </Text>
            )}
          </View>
        </View>

        {/* Main Content */}
        <View style={styles.mainContent}>
          {/* Left Column: Payroll Breakdown Table */}
          <View style={styles.leftColumn}>
            <Text style={styles.sectionTitle}>Éléments de la simulation</Text>
            
            <View style={styles.table}>
              {/* Table Header */}
              <View style={styles.tableHeader}>
                <Text style={styles.tableHeaderCell}>Éléments de la simulation</Text>
                <Text style={styles.tableHeaderCell}>Montant</Text>
                <Text style={styles.tableHeaderCell}>Taux</Text>
              </View>
              
              {/* Table Body - Match ResponseDetails structure exactly */}
              
              {/* Chiffre d'affaires */}
              <View style={styles.tableRowBlue}>
                <Text style={styles.tableCellBold}>Chiffre d'affaires HT</Text>
                <Text style={styles.tableCellAmountBold}>{(metrics.chiffreAffaires || 0).toFixed(2)} €</Text>
                <Text style={styles.tableCellAmountBold}>100.00 %</Text>
              </View>
              
              {/* Management Fees */}
              <View style={styles.tableRow}>
                <Text style={styles.tableCell}>Frais de gestion</Text>
                <Text style={styles.tableCellAmount}>-{(metrics.fraisGestionAmount || 0).toFixed(2)} €</Text>
                <Text style={styles.tableCellAmount}>{((metrics.fraisGestionAmount || 0) / (metrics.chiffreAffaires || 1) * 100).toFixed(2)} %</Text>
              </View>
              
              {/* Remaining after management fees */}
              <View style={styles.tableRowGray}>
                <Text style={styles.tableCellBold}>Montant restant après frais de gestion</Text>
                <Text style={styles.tableCellAmountBold}>{((metrics.chiffreAffaires || 0) - (metrics.fraisGestionAmount || 0)).toFixed(2)} €</Text>
                <Text style={styles.tableCellAmountBold}>{(((metrics.chiffreAffaires || 0) - (metrics.fraisGestionAmount || 0)) / (metrics.chiffreAffaires || 1) * 100).toFixed(2)} %</Text>
              </View>
              
              {/* Detailed Employer Social Contributions Header */}
              <View style={styles.tableRowGray}>
                <Text style={styles.tableCellBold}>Charges sociales patronales (payées par l'employeur - à titre informatif)</Text>
                <Text style={styles.tableCellAmount}></Text>
                <Text style={styles.tableCellAmount}></Text>
              </View>
              
              {/* Detailed Employer Social Contributions */}
              {response.response_data?.selected_organismes?.map((organisme: SelectedOrganisme, index: number) => (
                <View key={`patronal-${index}`} style={styles.tableRowGray}>
                  <Text style={styles.tableCell}>• {organisme.label} (Patronal)</Text>
                  <Text style={styles.tableCellAmount}>{((metrics.brutSalary || 0) * (organisme.total_patronal || 0) / 100).toFixed(2)} €</Text>
                  <Text style={styles.tableCellAmount}>{(organisme.total_patronal || 0).toFixed(3)} %</Text>
                </View>
              ))}
              
              {/* Total Employer Contributions */}
              <View style={styles.tableRowGray}>
                <Text style={styles.tableCellBold}>Total charges patronales</Text>
                <Text style={styles.tableCellAmountBold}>{(metrics.chargesPatronales || 0).toFixed(2)} €</Text>
                <Text style={styles.tableCellAmountBold}>{((metrics.chargesPatronales || 0) / (metrics.brutSalary || 1) * 100).toFixed(2)} %</Text>
              </View>
              
              {/* Gross Salary */}
              <View style={styles.tableRowBlue}>
                <Text style={styles.tableCellBold}>Salaire brut</Text>
                <Text style={styles.tableCellAmountBold}>{(metrics.brutSalary || 0).toFixed(2)} €</Text>
                <Text style={styles.tableCellAmountBold}>{((metrics.brutSalary || 0) / (metrics.chiffreAffaires || 1) * 100).toFixed(2)} %</Text>
              </View>
              
              {/* Employee Social Contributions Header */}
              <View style={styles.tableRowGray}>
                <Text style={styles.tableCellBold}>Charges sociales salariales (payées par le salarié)</Text>
                <Text style={styles.tableCellAmount}></Text>
                <Text style={styles.tableCellAmount}></Text>
              </View>
              
              {/* Detailed Employee Social Contributions */}
              {response.response_data?.selected_organismes?.map((organisme: SelectedOrganisme, index: number) => (
                <View key={`salarial-${index}`} style={styles.tableRow}>
                  <Text style={styles.tableCell}>• {organisme.label} (Salarié)</Text>
                  <Text style={styles.tableCellAmount}>-{((metrics.brutSalary || 0) * (organisme.total_salarial || 0) / 100).toFixed(2)} €</Text>
                  <Text style={styles.tableCellAmount}>{(organisme.total_salarial || 0).toFixed(3)} %</Text>
                </View>
              ))}
              
              {/* Total Employee Contributions */}
              <View style={styles.tableRow}>
                <Text style={styles.tableCellBold}>Total charges sociales salariales</Text>
                <Text style={styles.tableCellAmountBold}>-{(metrics.chargesSalariales || 0).toFixed(2)} €</Text>
                <Text style={styles.tableCellAmountBold}>{((metrics.chargesSalariales || 0) / (metrics.brutSalary || 1) * 100).toFixed(2)} %</Text>
              </View>
              
              {/* Net Salary */}
              <View style={styles.tableRow}>
                <Text style={styles.tableCellBold}>Net à payer (imposable)</Text>
                <Text style={styles.tableCellAmountBold}>{(metrics.netBeforeServices || 0).toFixed(2)} €</Text>
                <Text style={styles.tableCellAmountBold}>{((metrics.netBeforeServices || 0) / (metrics.chiffreAffaires || 1) * 100).toFixed(2)} %</Text>
              </View>
              
              {/* Detailed Professional Services */}
              {response.response_data?.services?.filter((service: ServiceResponseData) => service.is_available).map((service: ServiceResponseData, index: number) => (
                <View key={`service-${index}`} style={styles.tableRow}>
                  <Text style={styles.tableCell}>• {service.service_name}</Text>
                  <Text style={styles.tableCellAmount}>+{(service.charge_pro || 0).toFixed(2)} €</Text>
                  <Text style={styles.tableCellAmount}>{((service.charge_pro || 0) / (metrics.chiffreAffaires || 1) * 100).toFixed(2)} %</Text>
                </View>
              ))}
              
              {/* Total Services */}
              {(metrics.selectedServicesTotal || 0) > 0 && (
                <View style={styles.tableRowBlue}>
                  <Text style={styles.tableCellBold}>Total services professionnels</Text>
                  <Text style={styles.tableCellAmountBold}>+{(metrics.selectedServicesTotal || 0).toFixed(2)} €</Text>
                  <Text style={styles.tableCellAmountBold}>{((metrics.selectedServicesTotal || 0) / (metrics.chiffreAffaires || 1) * 100).toFixed(2)} %</Text>
                </View>
              )}
              
              {/* Final Net Amount */}
              <View style={styles.tableRow}>
                <Text style={styles.tableCellBold}>Net final reçu</Text>
                <Text style={styles.tableCellAmountBold}>{(metrics.netFinal || 0).toFixed(2)} €</Text>
                <Text style={styles.tableCellAmountBold}>{(metrics.percentageRecu || 0).toFixed(2)} %</Text>
              </View>
            </View>
            
            {/* Footer Notes */}
            <View style={styles.footerNotes}>
              <Text style={styles.footerText}>* Cette simulation est donnée à titre indicatif et n'a aucun caractère contractuel</Text>
              <Text style={styles.footerText}>* Tous nos services de portage salarial sont comprenant la gestion intégrale du salaire, gestion de votre activité, assurances, formations...</Text>
            </View>
          </View>

          {/* Right Column: Summary and Charts */}
          <View style={styles.rightColumn}>
            {/* Cost Distribution Chart */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Répartition des coûts</Text>
              <View style={styles.chartContainer}>
                <Svg width="100" height="100" viewBox="0 0 100 100">
                  {pieSlices.map((slice, index) => (
                    <Path
                      key={index}
                      d={slice.path}
                      fill={slice.color}
                      stroke="#ffffff"
                      strokeWidth="1"
                    />
                  ))}
                </Svg>
              </View>
              
              {/* Chart Legend */}
              <View style={styles.legendContainer}>
                {chartData.map((item, index) => (
                  <View key={index} style={styles.legendItem}>
                    <View style={[styles.legendColor, { backgroundColor: item.color }]} />
                    <Text style={styles.legendText}>
                      {item.label} {item.percentage.toFixed(2)}%
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Management Fees */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>
                Frais de gestion {(response.response_data?.frais_de_gestion?.value || ((metrics.fraisGestionAmount || 0) / (metrics.chiffreAffaires || 1) * 100)).toFixed(2)}%
              </Text>
              <Text style={styles.orangeAmount}>{(metrics.fraisGestionAmount || 0).toFixed(2)} €</Text>
              <Text style={styles.chartText}>
                {response.response_data?.frais_de_gestion?.manual ? 'Calculé manuellement' : 'Calculé automatiquement'}
              </Text>
            </View>

            {/* Summary Stats */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Résumé</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Chiffre d'affaires:</Text>
                <Text style={styles.summaryValue}>{(metrics.chiffreAffaires || 0).toFixed(2)} €</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Net imposable:</Text>
                <Text style={styles.summaryValue}>{(metrics.netBeforeServices || 0).toFixed(2)} €</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>% reçu du CA:</Text>
                <Text style={styles.summaryValue}>{(metrics.percentageRecu || 0).toFixed(2)}%</Text>
              </View>
              <View style={styles.summaryTotal}>
                <View style={styles.summaryRow}>
                  <Text style={styles.totalLabel}>Net final:</Text>
                  <Text style={styles.totalValue}>{(metrics.netFinal || 0).toFixed(2)} €</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default ResponseDetailsPDF;