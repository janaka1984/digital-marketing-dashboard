import {
  Box,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useListPaymentsQuery } from "@services/billingApi";
import { formatDate, formatMoney, statusTone } from "./billingUtils";

export default function PaymentHistory() {
  const { data: payments = [], isLoading, isError } = useListPaymentsQuery();

  return (
    <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: 3 }}>
      <Stack spacing={2}>
        <Box>
          <Typography variant="h5" fontWeight={800}>
            Payment History
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Gateway payments recorded for this workspace.
          </Typography>
        </Box>

        {isLoading ? (
          <Stack alignItems="center" sx={{ py: 5 }}>
            <CircularProgress />
          </Stack>
        ) : isError ? (
          <Typography color="error">
            Payment history could not be loaded.
          </Typography>
        ) : payments.length === 0 ? (
          <Box sx={{ py: 5, textAlign: "center" }}>
            <Typography fontWeight={700}>No payments yet</Typography>
            <Typography variant="body2" color="text.secondary">
              Completed payments will appear here after checkout and webhook processing.
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table size="small" aria-label="payment history">
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Gateway</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      {formatDate(payment.paid_at || payment.created_at)}
                    </TableCell>
                    <TableCell sx={{ textTransform: "capitalize" }}>
                      {payment.gateway}
                    </TableCell>
                    <TableCell>
                      {formatMoney(payment.amount, payment.currency)}
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        color={statusTone(payment.status) as any}
                        label={payment.status.replace(/_/g, " ")}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Stack>
    </Paper>
  );
}
